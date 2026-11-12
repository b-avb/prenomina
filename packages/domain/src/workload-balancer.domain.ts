import type {
  AcademicUnitSummary,
  BusinessRulesConfig,
  FacultyTeacher,
  SacCode,
  TeacherDedication,
} from './types/payroll.types.js';
import { WorkloadCalculatorDomain } from './workload-calculator.domain.js';
import type { IdGenerator } from './ports/id-generator.js';

/** Contractual monthly hour targets per teacher dedication category. */
export const EXPECTED_WORKLOAD_BY_DEDICATION: Readonly<Record<TeacherDedication, number>> = {
  TC: 160,
  MT: 80,
  CATEDRA: 48,
  DIRECTIVO: 210,
};

export interface HourBalanceSuggestion {
  id: string;
  code: string;
  activityName: string;
  currentHours: number;
  proposedHours: number;
  delta: number;
  explanation: string;
  suggestionType: 'bag' | 'pse' | 'activity' | 'reduction';
}

export interface CreateTeacherPayload {
  documentId: string;
  fullName: string;
  dedication: TeacherDedication;
  rank: string;
  education: string;
  isProvisional: boolean;
  sharedHours?: number;
  sharedUnitName?: string;
}

/**
 * Assists Deans in reconciling a teacher's allocated monthly hours with their
 * contractual `expectedWorkload` and maintains derived postgraduate/snapshot fields.
 */
export class WorkloadBalancerDomain {
  /**
   * Computes up to five ranked adjustment candidates to close a teacher's hour deficit or surplus,
   * prioritizing PSE (`40108`) alignment, remaining Annex 5/6 unit bag capacity, and general SAC caps.
   */
  public static suggestTeacherHourBalance(
    teacher: FacultyTeacher,
    unit: AcademicUnitSummary | undefined,
    allTeachers: FacultyTeacher[],
    sacCodes: SacCode[],
    rulesConfig: BusinessRulesConfig,
  ): HourBalanceSuggestion[] {
    if (!unit) return [];
    const total = WorkloadCalculatorDomain.computeTeacherTotalHours(teacher, rulesConfig);
    const diff = Math.round((teacher.expectedWorkload - total) * 10) / 10;
    if (Math.abs(diff) < 0.1) return [];

    const suggestions: HourBalanceSuggestion[] = [];

    // Reconcile manual PSE overrides when restoring the 25% formula moves total hours toward expectedWorkload.
    const exactPse = WorkloadCalculatorDomain.computeExactPse25(teacher, rulesConfig);
    const currentPse = WorkloadCalculatorDomain.getEffectivePse(teacher, rulesConfig);
    if (teacher.dedication !== 'CATEDRA' && Math.abs(exactPse - currentPse) > 0.1) {
      const deltaPse = Math.round((exactPse - currentPse) * 10) / 10;
      if ((diff > 0 && deltaPse > 0) || (diff < 0 && deltaPse < 0)) {
        const h40104 = WorkloadCalculatorDomain.computeHours40104(teacher);
        suggestions.push({
          id: `sug-pse-${teacher.id}`,
          code: '40108',
          activityName: 'Ajustar PSE al 25% exacto de docencia directa',
          currentHours: currentPse,
          proposedHours: exactPse,
          delta: deltaPse,
          explanation: `Con ${h40104} h de clase (40104), el 25% normativo equivale a ${exactPse} h.`,
          suggestionType: 'pse',
        });
      }
    }

    if (diff > 0) {
      // Prefer unallocated headroom in unit-level Annex 5/6 hour bags before generic SAC activities.
      const bags = WorkloadCalculatorDomain.computeUnitBagIndicators(
        unit,
        allTeachers,
        rulesConfig,
      );
      for (const bag of bags) {
        const bagBalance = bag.cap - bag.allocated;
        if (bagBalance > 0) {
          const def = sacCodes.find((c) => c.code === bag.code);
          const current = teacher.allocations[bag.code]?.hours ?? 0;
          const teacherCap = def?.capHours ?? 40;
          const teacherMargin = Math.max(0, teacherCap - current);
          const addHours = Math.min(
            diff,
            bagBalance,
            teacherMargin > 0 ? teacherMargin : diff,
          );
          if (addHours > 0) {
            suggestions.push({
              id: `sug-bag-${bag.code}`,
              code: bag.code,
              activityName: `${bag.fullTitle} (${bagBalance} h disponibles en bolsa)`,
              currentHours: current,
              proposedHours: current + addHours,
              delta: addHours,
              explanation: `La bolsa ${bag.code} (${bag.source}) registra ${bag.allocated} de ${bag.cap} h en la unidad. Asignar ${addHours} h completa la carga dentro del cupo disponible.`,
              suggestionType: 'bag',
            });
          }
        }
      }

      const fallbackCodes = ['40107', '10410', '20222', '30411', '40106', '40127'];
      for (const code of fallbackCodes) {
        if (suggestions.some((s) => s.code === code)) continue;
        const def = sacCodes.find((c) => c.code === code);
        if (!def) continue;
        const current = teacher.allocations[code]?.hours ?? 0;
        const cap = def.capHours ?? 32;
        if (current < cap) {
          const addHours = Math.min(diff, cap - current);
          const proposed = Math.max(def.baseHours ?? 4, current + addHours);
          if (proposed <= cap) {
            const cleanGuideline = def.guideline.trim().replace(/\.$/, '');
            suggestions.push({
              id: `sug-act-${code}`,
              code,
              activityName: def.name.replace('TUNJA ', ''),
              currentHours: current,
              proposedHours: proposed,
              delta: proposed - current,
              explanation: `${cleanGuideline} (base: ${def.baseHours ?? 4} h, tope: ${cap} h).`,
              suggestionType: 'activity',
            });
          }
        }
      }
    } else {
      // Exclude 40104 and 40108 from direct reduction candidates because they derive from academic spaces.
      const excess = Math.abs(diff);
      for (const alloc of Object.values(teacher.allocations)) {
        if (
          !alloc.hours ||
          alloc.hours <= 0 ||
          alloc.code === '40104' ||
          alloc.code === '40108'
        ) {
          continue;
        }
        const def = sacCodes.find((c) => c.code === alloc.code);
        const reduceBy = Math.min(excess, alloc.hours);
        const nextValue = alloc.hours - reduceBy;
        suggestions.push({
          id: `sug-red-${alloc.code}`,
          code: alloc.code,
          activityName: def?.name.replace('TUNJA ', '') ?? `Código ${alloc.code}`,
          currentHours: alloc.hours,
          proposedHours: nextValue,
          delta: -reduceBy,
          explanation:
            nextValue === 0
              ? `Retirar las ${alloc.hours} h del código ${alloc.code} para corregir el exceso de carga.`
              : `Reducir de ${alloc.hours} h a ${nextValue} h (-${reduceBy} h) para ajustar a las ${teacher.expectedWorkload} h del periodo.`,
          suggestionType: 'reduction',
        });
      }
    }

    return suggestions.slice(0, 5);
  }

  /** Instantiates a clean `0 h` teacher record; generates a synthetic `VACANTE-*` document ID when provisional. */
  public static buildNewTeacher(
    unitId: string,
    payload: CreateTeacherPayload,
    ids: IdGenerator,
  ): FacultyTeacher {
    const id = ids.next();
    return {
      id,
      unitId,
      documentId:
        payload.isProvisional && !payload.documentId
          ? `VACANTE-${id.slice(0, 8).toUpperCase()}`
          : payload.documentId,
      fullName: payload.fullName.toUpperCase(),
      dedication: payload.dedication,
      expectedWorkload: EXPECTED_WORKLOAD_BY_DEDICATION[payload.dedication],
      rank: payload.rank,
      education: payload.education,
      isProvisional: payload.isProvisional,
      seniorityYears: payload.isProvisional ? 0 : 3,
      sharedHours: payload.sharedHours || 0,
      sharedUnitName: payload.sharedUnitName || '',
      academicSpaces: [],
      allocations: {},
    };
  }

  /**
   * Synchronizes SAC code `40006` with the sum of `Posgrado` space monthly hours and clears
   * `pseManualOverride` so PSE (`40108`) reflects the updated direct teaching load.
   */
  public static syncPostgraduateAllocations(
    teacher: FacultyTeacher,
    options?: { clearWhenNoPostgradSpaces?: boolean },
  ): void {
    const totalPostgrad = teacher.academicSpaces
      .filter((s) => s.level === 'Posgrado')
      .reduce((a, b) => a + b.monthlyHours, 0);
    const existing = teacher.allocations['40006'];
    if (totalPostgrad > 0) {
      teacher.allocations['40006'] = {
        ...existing,
        code: '40006',
        hours: totalPostgrad,
      };
    } else if (options?.clearWhenNoPostgradSpaces) {
      delete teacher.allocations['40006'];
    }
    teacher.pseManualOverride = null;
  }

  /**
   * Records `version1Total` and per-code `version1Hours` baselines on unit teachers so
   * curriculum review adjustments made in v2+ can be compared against the initial submission.
   */
  public static snapshotTeachersVersion1(
    unitTeachers: FacultyTeacher[],
    rulesConfig: BusinessRulesConfig,
    options?: { forceOverwrite?: boolean },
  ): void {
    const force = options?.forceOverwrite ?? true;
    for (const teacher of unitTeachers) {
      if (force || teacher.version1Total === undefined) {
        teacher.version1Total = WorkloadCalculatorDomain.computeTeacherTotalHours(
          teacher,
          rulesConfig,
        );
      }
      for (const alloc of Object.values(teacher.allocations)) {
        if (force || alloc.version1Hours === undefined) {
          alloc.version1Hours = alloc.hours;
        }
      }
    }
  }
}
