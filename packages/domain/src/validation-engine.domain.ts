import type {
  AcademicUnitSummary,
  ApprovalRequestAnnex3,
  BusinessRulesConfig,
  FacultyTeacher,
  SacCode,
} from './types/payroll.types.js';
import { WorkloadCalculatorDomain } from './workload-calculator.domain.js';

export interface ValidationAlert {
  id: string;
  ruleId: string;
  severity: 'blocking' | 'alert' | 'info';
  teacherId?: string;
  teacherName?: string;
  code?: string;
  title: string;
  detail: string;
  justified?: boolean;
  justificationText?: string;
}

const EXCLUSIVE_UNIT_RESTRICTIONS: Readonly<
  Record<string, { ids: string[]; label: string }>
> = {
  '40105': { ids: ['derecho', 'fac-derecho'], label: 'Facultad de Derecho' },
  '20131': { ids: ['derecho', 'fac-derecho'], label: 'Facultad de Derecho' },
  '40137': { ids: ['derecho', 'fac-derecho'], label: 'Facultad de Derecho' },
  '10224': { ids: ['derecho', 'fac-derecho'], label: 'Facultad de Derecho' },
  '40317': { ids: ['arquitectura', 'fac-arquitectura'], label: 'Facultad de Arquitectura' },
  '30307': { ids: ['arquitectura', 'fac-arquitectura'], label: 'Facultad de Arquitectura' },
  '40318': {
    ids: ['lic-lenguas', 'fac-lic-espanol'],
    label: 'Licenciatura en Español y Lenguas Extranjeras',
  },
  '20311': {
    ids: ['lic-lenguas', 'fac-lic-espanol'],
    label: 'Licenciatura en Español y Lenguas Extranjeras',
  },
  '40123': { ids: ['cilce', 'dir-cilce'], label: 'Instituto de Lenguas CILCE' },
  '20222': {
    ids: [
      'adm-empresas',
      'contaduria',
      'negocios-int',
      'fac-administracion',
      'fac-contaduria',
      'fac-negocios',
    ],
    label: 'Administración, Contaduría y Negocios Internacionales',
  },
};

export interface ValidationContext {
  units: AcademicUnitSummary[];
  teachers: FacultyTeacher[];
  sacCodes: SacCode[];
  approvalRequests: ApprovalRequestAnnex3[];
  rulesConfig: BusinessRulesConfig;
}

export class ValidationEngineDomain {
  public static resolveEffectiveCodeCap(
    definition: SacCode,
    unit?: Pick<AcademicUnitSummary, 'id' | 'hasPostgraduates' | 'graduatesCap20502'>,
    rulesConfig?: Pick<BusinessRulesConfig, 'enforceAnnex6CapOnGraduates'>,
  ): number | null {
    const unitRule = unit
      ? definition.facultyRules?.find((r) => r.unitId === unit.id)
      : undefined;
    let effectiveMax =
      unitRule && unitRule.maxTeacherHours !== null
        ? unitRule.maxTeacherHours
        : unit?.hasPostgraduates && definition.postgraduateCapHours
          ? definition.postgraduateCapHours
          : definition.capHours;

    if (
      definition.code === '20502' &&
      rulesConfig?.enforceAnnex6CapOnGraduates &&
      unit &&
      effectiveMax !== null &&
      !unitRule
    ) {
      effectiveMax = Math.max(effectiveMax, unit.graduatesCap20502);
    }
    return effectiveMax;
  }

  public static validateTeacher(
    teacher: FacultyTeacher,
    ctx: ValidationContext,
  ): ValidationAlert[] {
    const alerts: ValidationAlert[] = [];
    const unit = ctx.units.find((u) => u.id === teacher.unitId);
    const total = WorkloadCalculatorDomain.computeTeacherTotalHours(teacher, ctx.rulesConfig);
    const h40104 = WorkloadCalculatorDomain.computeHours40104(teacher);
    const h40006 = WorkloadCalculatorDomain.computeHours40006(teacher);
    const exactPse = WorkloadCalculatorDomain.computeExactPse25(teacher, ctx.rulesConfig);
    const effectivePse = WorkloadCalculatorDomain.getEffectivePse(teacher, ctx.rulesConfig);

    // RN-22: Duplicate document ID
    const duplicates = ctx.teachers.filter(
      (t) =>
        t.unitId === teacher.unitId &&
        t.documentId === teacher.documentId &&
        t.id !== teacher.id,
    );
    if (duplicates.length > 0) {
      alerts.push({
        id: `${teacher.id}-rn22`,
        ruleId: 'RN-22',
        severity: 'blocking',
        teacherId: teacher.id,
        teacherName: teacher.fullName,
        title: `Cédula duplicada (${teacher.documentId})`,
        detail: `Documento compartido con ${duplicates.map((x) => x.fullName).join(', ')}.`,
      });
    }

    // RN-01: Expected monthly workload
    if (total > teacher.expectedWorkload) {
      alerts.push({
        id: `${teacher.id}-rn01-over`,
        ruleId: 'RN-01',
        severity: 'blocking',
        teacherId: teacher.id,
        teacherName: teacher.fullName,
        title: `Excede carga mensual (${total} / ${teacher.expectedWorkload} h)`,
        detail: `Supera por +${total - teacher.expectedWorkload} h la dedicación ${teacher.dedication}.`,
      });
    } else if (total < teacher.expectedWorkload) {
      alerts.push({
        id: `${teacher.id}-rn01-under`,
        ruleId: 'RN-01',
        severity: 'alert',
        teacherId: teacher.id,
        teacherName: teacher.fullName,
        title: `Carga incompleta (${total} / ${teacher.expectedWorkload} h)`,
        detail: `Faltan ${teacher.expectedWorkload - total} h para completar ${teacher.expectedWorkload} h/mes.`,
      });
    }

    // RN-02: PSE 25%
    if (teacher.dedication !== 'CATEDRA' && Math.abs(effectivePse - exactPse) > 0.01) {
      alerts.push({
        id: `${teacher.id}-rn02`,
        ruleId: 'RN-02',
        severity: 'alert',
        teacherId: teacher.id,
        teacherName: teacher.fullName,
        code: '40108',
        title: `PSE (40108) en ${effectivePse} h (calculado = ${exactPse} h)`,
        detail: `Con ${h40104} h en 40104, el PSE correspondiente es ${exactPse} h/mes.`,
      });
    }

    // RN-12: Directors must teach at least 1 academic space
    if (teacher.dedication === 'DIRECTIVO' && h40104 === 0 && h40006 === 0) {
      alerts.push({
        id: `${teacher.id}-rn12`,
        ruleId: 'RN-12',
        severity: 'alert',
        teacherId: teacher.id,
        teacherName: teacher.fullName,
        code: '30222',
        title: 'Directivo sin espacio académico (Lineamiento B-12)',
        detail: 'Debe orientar al menos 1 espacio en pregrado (40104) o posgrado (40006).',
      });
    }

    // RN-14: Minimum direct teaching for Full-Time (TC)
    const minTc = ctx.rulesConfig.minFullTimeTeachingHours || 96;
    if (teacher.dedication === 'TC' && h40104 < minTc) {
      alerts.push({
        id: `${teacher.id}-rn14`,
        ruleId: 'RN-14',
        severity: 'info',
        teacherId: teacher.id,
        teacherName: teacher.fullName,
        code: '40104',
        title: `Docencia directa (${h40104} h) menor a ${minTc} h/mes`,
        detail: 'Permitido si cuenta con descarga por investigación, calidad o gestión curricular.',
      });
    }

    // RN-19: Maximum recommended academic spaces
    const maxSpaces = ctx.rulesConfig.maxRecommendedAcademicSpaces || 4;
    if (teacher.academicSpaces.length > maxSpaces) {
      alerts.push({
        id: `${teacher.id}-rn19`,
        ruleId: 'RN-19',
        severity: 'info',
        teacherId: teacher.id,
        teacherName: teacher.fullName,
        code: '40104',
        title: `${teacher.academicSpaces.length} espacios asignados (recomendado máx. ${maxSpaces})`,
        detail: 'Directriz de bienestar docente (Capítulo B, pág. 9).',
      });
    }

    // RN-17: Shared teachers across units
    if (teacher.sharedHours && teacher.sharedHours > 0) {
      const consolidated = total + teacher.sharedHours;
      if (consolidated > teacher.expectedWorkload) {
        alerts.push({
          id: `${teacher.id}-rn17`,
          ruleId: 'RN-17',
          severity: 'blocking',
          teacherId: teacher.id,
          teacherName: teacher.fullName,
          title: `Docente compartido supera carga consolidada (${consolidated} / ${teacher.expectedWorkload} h)`,
          detail: `Tiene ${total} h en esta unidad + ${teacher.sharedHours} h en ${teacher.sharedUnitName || 'otra unidad'} (Lineamiento B-15).`,
        });
      }
    }

    // RN-15: Adjunct (CATEDRA) teachers can only teach direct courses
    if (
      teacher.dedication === 'CATEDRA' &&
      WorkloadCalculatorDomain.computeOtherSacHours(teacher) > 0
    ) {
      alerts.push({
        id: `${teacher.id}-rn15`,
        ruleId: 'RN-15',
        severity: 'blocking',
        teacherId: teacher.id,
        teacherName: teacher.fullName,
        title: 'Docente de Cátedra con funciones distintas a docencia directa',
        detail:
          'Según ANEXO 4 (Hoja DOCENCIA), los docentes hora cátedra solo pueden registrar orientación de espacios académicos (16–48 h/mes).',
      });
    }

    // RN-21: Provisional teachers / vacancies
    if (teacher.isProvisional) {
      alerts.push({
        id: `${teacher.id}-rn21`,
        ruleId: 'RN-21',
        severity: 'info',
        teacherId: teacher.id,
        teacherName: teacher.fullName,
        title: 'Vacante / Docente Provisional (Lineamiento B-11)',
        detail:
          'Recuerda reemplazar por cédula real al vincularse. Docentes adicionales a 2026-1 requieren aval de V.A. y Rectoría.',
      });
    }

    // RN-03, RN-05, RN-06, RN-09, RN-11, RN-18: Per-SAC-code validations
    for (const alloc of Object.values(teacher.allocations)) {
      if (!alloc.hours || alloc.hours <= 0) continue;
      const def = ctx.sacCodes.find((c) => c.code === alloc.code);
      if (!def) continue;

      const restriction = EXCLUSIVE_UNIT_RESTRICTIONS[alloc.code];
      if (restriction && !restriction.ids.includes(teacher.unitId)) {
        alerts.push({
          id: `${teacher.id}-${alloc.code}-rn06`,
          ruleId: 'RN-06',
          severity: alloc.exceptionJustification ? 'info' : 'blocking',
          teacherId: teacher.id,
          teacherName: teacher.fullName,
          code: alloc.code,
          title: `Cód. ${alloc.code} exclusivo de ${restriction.label}`,
          detail: `El ANEXO 4 restringe el código ${alloc.code} (${def.name}) únicamente a ${restriction.label}.`,
          justified: Boolean(alloc.exceptionJustification),
          justificationText: alloc.exceptionJustification,
        });
      }

      if (
        ['40106', '40109', '30411'].includes(alloc.code) &&
        teacher.seniorityYears !== undefined &&
        teacher.seniorityYears < 2
      ) {
        alerts.push({
          id: `${teacher.id}-${alloc.code}-rn18`,
          ruleId: 'RN-18',
          severity: 'alert',
          teacherId: teacher.id,
          teacherName: teacher.fullName,
          code: alloc.code,
          title: `Antigüedad menor a 2 años para Cód. ${alloc.code} (${teacher.seniorityYears} año(s))`,
          detail:
            'El Lineamiento B-20 exige mínimo 2 años de vinculación en la USTA para líderes de Calidad (30411), Currículo (40106) y SEA (40109).',
        });
      }

      const unitRule = def.facultyRules?.find((r) => r.unitId === teacher.unitId);
      const effectiveMin =
        unitRule && unitRule.minTeacherHours !== null ? unitRule.minTeacherHours : def.baseHours;

      const effectiveMax = this.resolveEffectiveCodeCap(def, unit, ctx.rulesConfig);

      if (effectiveMin !== null && alloc.hours < effectiveMin) {
        alerts.push({
          id: `${teacher.id}-${alloc.code}-min`,
          ruleId: 'RN-03',
          severity: 'alert',
          teacherId: teacher.id,
          teacherName: teacher.fullName,
          code: alloc.code,
          title: `Cód. ${alloc.code} bajo el mínimo (${alloc.hours} h < ${effectiveMin} h)`,
          detail: unitRule
            ? `Regla específica para ${unit?.name}: mínimo ${effectiveMin} h/mes.`
            : `${def.name} exige mínimo ${effectiveMin} h/mes.`,
          justified: Boolean(alloc.exceptionJustification),
          justificationText: alloc.exceptionJustification,
        });
      }

      if (effectiveMax !== null && alloc.hours > effectiveMax) {
        alerts.push({
          id: `${teacher.id}-${alloc.code}-max`,
          ruleId: 'RN-03',
          severity: alloc.exceptionJustification
            ? 'info'
            : def.severity === 'blocking'
              ? 'blocking'
              : 'alert',
          teacherId: teacher.id,
          teacherName: teacher.fullName,
          code: alloc.code,
          title: `Cód. ${alloc.code} supera el tope (${alloc.hours} h > ${effectiveMax} h)`,
          detail: alloc.exceptionJustification
            ? `Excepción justificada: "${alloc.exceptionJustification}"`
            : unitRule
              ? `Regla específica para ${unit?.name}: máximo ${effectiveMax} h/mes.`
              : `Tope máximo ANEXO 4: ${effectiveMax} h/mes.`,
          justified: Boolean(alloc.exceptionJustification),
          justificationText: alloc.exceptionJustification,
        });
      }

      if (alloc.code === '10226' && ![20, 80, 136].includes(alloc.hours)) {
        alerts.push({
          id: `${teacher.id}-rn11-sicddi`,
          ruleId: 'RN-11',
          severity: alloc.exceptionJustification ? 'info' : 'blocking',
          teacherId: teacher.id,
          teacherName: teacher.fullName,
          code: '10226',
          title: `SICDDI (${alloc.hours} h) fuera de niveles Acuerdo 3 (20, 80 o 136 h)`,
          detail: 'Acuerdo 3 del 19/03/2025: Nivel I = 20 h, Nivel II = 80 h, Nivel III = 136 h.',
          justified: Boolean(alloc.exceptionJustification),
          justificationText: alloc.exceptionJustification,
        });
      }

      if (def.requiresViceRectorApproval) {
        const request = ctx.approvalRequests.find(
          (r) => r.teacherId === teacher.id && r.code === alloc.code,
        );
        if (!request) {
          alerts.push({
            id: `${teacher.id}-${alloc.code}-aval-missing`,
            ruleId: 'RN-09',
            severity: 'alert',
            teacherId: teacher.id,
            teacherName: teacher.fullName,
            code: alloc.code,
            title: `Cód. ${alloc.code} sin formato ANEXO 3 radicado`,
            detail: `Tiene ${alloc.hours} h en ${def.name}; diligencia el formato digital ANEXO 3.`,
          });
        } else if (request.status !== 'Avalado') {
          alerts.push({
            id: `${teacher.id}-${alloc.code}-aval-pending`,
            ruleId: 'RN-09',
            severity: request.status === 'Con Observaciones' ? 'alert' : 'info',
            teacherId: teacher.id,
            teacherName: teacher.fullName,
            code: alloc.code,
            title: `Pre-Aval V.A. Cód. ${alloc.code}: ${request.status}`,
            detail: request.viceRectorNote ?? 'En bandeja de Vicerrectoría Académica.',
          });
        }
      }
    }

    return alerts;
  }

  public static getUnitAlerts(unitId: string, ctx: ValidationContext): ValidationAlert[] {
    const list: ValidationAlert[] = [];
    const unit = ctx.units.find((u) => u.id === unitId) ?? ctx.units[0];
    if (!unit) return list;

    const unitTeachers = ctx.teachers.filter((t) => t.unitId === unitId);
    for (const teacher of unitTeachers) {
      list.push(...this.validateTeacher(teacher, ctx));
    }

    for (const bag of WorkloadCalculatorDomain.computeUnitBagIndicators(
      unit,
      ctx.teachers,
      ctx.rulesConfig,
    )) {
      if (bag.allocated !== bag.cap) {
        list.push({
          id: `bag-${unitId}-${bag.code}`,
          ruleId: 'RN-04',
          severity: bag.allocated > bag.cap ? 'blocking' : 'alert',
          code: bag.code,
          title: `Bolsa ${bag.code} (${bag.title}): ${bag.allocated} / ${bag.cap} h (${bag.source})`,
          detail:
            bag.allocated > bag.cap
              ? `Excede por +${bag.allocated - bag.cap} h el tope de facultad.`
              : `Faltan ${bag.cap - bag.allocated} h por asignar en la facultad.`,
        });
      }
    }

    const sum40105 = WorkloadCalculatorDomain.sumCodeInUnit(
      ctx.teachers,
      unitId,
      '40105',
      ctx.rulesConfig,
    );
    if (sum40105 > 120) {
      list.push({
        id: `rn07-40105-${unitId}`,
        ruleId: 'RN-07',
        severity: 'blocking',
        code: '40105',
        title: `Preparatorios Derecho (40105) supera 120 h en la facultad (${sum40105} h)`,
        detail: 'El ANEXO 4 establece un límite agregado máximo de 120 h/mes para el código 40105.',
      });
    }

    const sum20131 = WorkloadCalculatorDomain.sumCodeInUnit(
      ctx.teachers,
      unitId,
      '20131',
      ctx.rulesConfig,
    );
    if (sum20131 > 320) {
      list.push({
        id: `rn07-20131-${unitId}`,
        ruleId: 'RN-07',
        severity: 'alert',
        code: '20131',
        title: `Consultorios Jurídicos (20131) supera 320 h en la facultad (${sum20131} h)`,
        detail:
          'Cualquier exceso sobre 320 h/mes requiere justificación escrita ante Vicerrectoría Académica.',
      });
    }

    const count40137 = unitTeachers.filter(
      (t) => (t.allocations['40137']?.hours ?? 0) > 0,
    ).length;
    if (count40137 > 4) {
      list.push({
        id: `rn07-40137-${unitId}`,
        ruleId: 'RN-07',
        severity: 'alert',
        code: '40137',
        title: `Examen Habilitante Abogados (40137) asignado a ${count40137} docentes (máx. 4)`,
        detail: 'El ANEXO 4 permite máximo 4 docentes en el código 40137.',
      });
    }

    for (const singleCode of ['20502', '20225']) {
      const countSingle = unitTeachers.filter(
        (t) => (t.allocations[singleCode]?.hours ?? 0) > 0,
      ).length;
      if (countSingle > 1) {
        list.push({
          id: `rn07-${singleCode}-${unitId}`,
          ruleId: 'RN-07',
          severity: 'alert',
          code: singleCode,
          title: `Código ${singleCode} asignado a ${countSingle} docentes (lineamiento: 1 docente por facultad)`,
          detail: `El ANEXO 4 indica que el código ${singleCode} se asigna a un (1) docente líder por facultad.`,
        });
      }
    }

    for (const codeItem of ctx.sacCodes) {
      const unitRule = codeItem.facultyRules?.find((r) => r.unitId === unitId);
      if (
        unitRule &&
        unitRule.facultyBagCap !== undefined &&
        unitRule.facultyBagCap !== null
      ) {
        const sum = WorkloadCalculatorDomain.sumCodeInUnit(
          ctx.teachers,
          unitId,
          codeItem.code,
          ctx.rulesConfig,
        );
        if (sum > unitRule.facultyBagCap) {
          list.push({
            id: `bag-custom-${unitId}-${codeItem.code}`,
            ruleId: 'RN-04',
            severity: codeItem.severity === 'blocking' ? 'blocking' : 'alert',
            code: codeItem.code,
            title: `Tope Facultad Cód. ${codeItem.code}: ${sum} / ${unitRule.facultyBagCap} h`,
            detail: `Excede por +${sum - unitRule.facultyBagCap} h el tope específico configurado para ${unitRule.unitName}.`,
          });
        }
      }
    }

    return list;
  }
}
