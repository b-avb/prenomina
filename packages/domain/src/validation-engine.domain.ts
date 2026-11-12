import type {
  AcademicUnitSummary,
  ApprovalRequestAnnex3,
  BusinessRulesConfig,
  FacultyTeacher,
  ProgramQuotaAnnex5,
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

export interface ValidationOptions {
  enforceSubmissionReadiness?: boolean;
}

const EXCLUSIVE_UNIT_RESTRICTIONS: Readonly<
  Record<string, { ids: string[]; label: string }>
> = {
  '40105': { ids: ['derecho'], label: 'Facultad de Derecho' },
  '20131': { ids: ['derecho'], label: 'Facultad de Derecho' },
  '40137': { ids: ['derecho'], label: 'Facultad de Derecho' },
  '10224': { ids: ['derecho'], label: 'Facultad de Derecho' },
  '40317': { ids: ['arquitectura'], label: 'Facultad de Arquitectura' },
  '30307': { ids: ['arquitectura'], label: 'Facultad de Arquitectura' },
  '40318': {
    ids: ['lic-lenguas'],
    label: 'Licenciatura en Español y Lenguas Extranjeras',
  },
  '20311': {
    ids: ['lic-lenguas'],
    label: 'Licenciatura en Español y Lenguas Extranjeras',
  },
  '40123': { ids: ['cilce'], label: 'CILCE - Instituto de Lenguas' },
  '20222': {
    ids: ['adm-empresas', 'contaduria', 'negocios-int'],
    label: 'Administración, Contaduría y Negocios Internacionales',
  },
};

export interface ValidationContext {
  units: AcademicUnitSummary[];
  teachers: FacultyTeacher[];
  sacCodes: SacCode[];
  approvalRequests: ApprovalRequestAnnex3[];
  rulesConfig: BusinessRulesConfig;
  programQuotas?: ProgramQuotaAnnex5[];
}

export class ValidationEngineDomain {
  public static getProgramCapForSacCode(
    program: Pick<
      ProgramQuotaAnnex5,
      'quality30411' | 'curriculum40106' | 'sea40109' | 'saberPro40127'
    >,
    code: string,
  ): number | null {
    switch (code) {
      case '30411':
        return program.quality30411;
      case '40106':
        return program.curriculum40106;
      case '40109':
        return program.sea40109;
      case '40127':
        return program.saberPro40127;
      default:
        return null;
    }
  }

  public static resolveEffectiveCodeCap(
    definition: SacCode,
    unit?: Pick<AcademicUnitSummary, 'id' | 'hasPostgraduates' | 'graduatesCap20502'>,
    rulesConfig?: Pick<BusinessRulesConfig, 'enforceAnnex6CapOnGraduates'>,
    program?: Pick<
      ProgramQuotaAnnex5,
      'quality30411' | 'curriculum40106' | 'sea40109' | 'saberPro40127'
    > | null,
  ): number | null {
    if (program) {
      const programCap = this.getProgramCapForSacCode(program, definition.code);
      if (programCap !== null) return programCap;
    }

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

  private static formatDedicationLabel(dedication: FacultyTeacher['dedication']): string {
    switch (dedication) {
      case 'TC':
        return 'tiempo completo';
      case 'MT':
        return 'medio tiempo';
      case 'CATEDRA':
        return 'hora cátedra';
      case 'DIRECTIVO':
        return 'directivo académico';
    }
  }

  public static validateTeacher(
    teacher: FacultyTeacher,
    ctx: ValidationContext,
    options?: ValidationOptions,
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
        title: `Documento duplicado (${teacher.documentId})`,
        detail: `Registrado también en ${duplicates.map((x) => x.fullName).join(', ')}. Verifique si corresponde a un docente compartido entre unidades.`,
      });
    }

    const isUnstarted = WorkloadCalculatorDomain.isTeacherUnstarted(teacher);
    if (
      !options?.enforceSubmissionReadiness &&
      (!unit || unit.payrollStatus === 'Borrador') &&
      isUnstarted
    ) {
      return alerts;
    }

    // RN-01: Expected monthly workload
    if (total > teacher.expectedWorkload) {
      alerts.push({
        id: `${teacher.id}-rn01-over`,
        ruleId: 'RN-01',
        severity: 'blocking',
        teacherId: teacher.id,
        teacherName: teacher.fullName,
        title: `Excede la carga mensual (${total} / ${teacher.expectedWorkload} h)`,
        detail: `Supera en ${total - teacher.expectedWorkload} h el tope mensual para vinculación de ${this.formatDedicationLabel(teacher.dedication)}.`,
      });
    } else if (total < teacher.expectedWorkload) {
      const blockUnstartedSubmission = Boolean(
        options?.enforceSubmissionReadiness && isUnstarted && teacher.expectedWorkload > 0,
      );
      alerts.push({
        id: `${teacher.id}-rn01-under`,
        ruleId: 'RN-01',
        severity: blockUnstartedSubmission ? 'blocking' : 'alert',
        teacherId: teacher.id,
        teacherName: teacher.fullName,
        title: blockUnstartedSubmission
          ? `Sin asignación horaria (0 / ${teacher.expectedWorkload} h)`
          : `Carga incompleta (${total} / ${teacher.expectedWorkload} h)`,
        detail:
          total === 0
            ? `Pendiente asignar las ${teacher.expectedWorkload} h/mes de su dedicación.`
            : `Faltan ${teacher.expectedWorkload - total} h para completar las ${teacher.expectedWorkload} h/mes.`,
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
        title: `Ajuste manual en PSE: ${effectivePse} h registradas (${exactPse} h según fórmula)`,
        detail: `Para ${h40104} h de docencia directa (40104) corresponden ${exactPse} h/mes de PSE (40108).`,
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
        title: 'Directivo sin espacio académico asignado',
        detail:
          'Según el Lineamiento B-12, todo directivo académico debe orientar al menos un espacio en pregrado (40104) o posgrado (40006).',
      });
    }

    // RN-14: Minimum direct teaching for Full-Time (TC)
    const minTc = ctx.rulesConfig.minFullTimeTeachingHours || 64;
    if (teacher.dedication === 'TC' && h40104 < minTc) {
      alerts.push({
        id: `${teacher.id}-rn14`,
        ruleId: 'RN-14',
        severity: 'info',
        teacherId: teacher.id,
        teacherName: teacher.fullName,
        code: '40104',
        title: `Docencia directa (${h40104} h) inferior a ${minTc} h/mes`,
        detail: 'Permitido cuando cuenta con descarga por investigación, calidad o gestión curricular.',
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
        title: `${teacher.academicSpaces.length} espacios académicos asignados (máximo sugerido: ${maxSpaces})`,
        detail: 'Supera el número de espacios sugerido por bienestar docente (Capítulo B, pág. 9).',
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
          detail: `Registra ${total} h en esta unidad y ${teacher.sharedHours} h en ${teacher.sharedUnitName || 'otra unidad'} (Lineamiento B-15).`,
        });
      }
    }

    // RN-15: Adjunct (CATEDRA) teachers can only teach direct courses (40104 Pregrado / 40006 Posgrado)
    const hasNonTeachingSacForCatedra = Object.values(teacher.allocations).some(
      (a) =>
        (Number(a.hours) || 0) > 0 &&
        a.code !== '40104' &&
        a.code !== '40108' &&
        a.code !== '40006',
    );
    if (teacher.dedication === 'CATEDRA' && hasNonTeachingSacForCatedra) {
      alerts.push({
        id: `${teacher.id}-rn15`,
        ruleId: 'RN-15',
        severity: 'blocking',
        teacherId: teacher.id,
        teacherName: teacher.fullName,
        title: 'Docente de hora cátedra con actividades no permitidas',
        detail:
          'Según el Anexo 4, la vinculación de hora cátedra solo admite docencia directa en pregrado (40104) o posgrado (40006).',
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
        title: 'Plaza vacante o docente provisional',
        detail:
          'Registre el documento definitivo al formalizar la vinculación (Lineamiento B-11). Las nuevas plazas requieren aval de Vicerrectoría Académica y Rectoría.',
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
          title: `Código ${alloc.code} exclusivo de ${restriction.label}`,
          detail: `Según el Anexo 4, esta actividad solo puede asignarse en ${restriction.label}.`,
          justified: Boolean(alloc.exceptionJustification),
          justificationText: alloc.exceptionJustification,
        });
      }

      if (
        ['40106', '40109', '30411'].includes(alloc.code) &&
        teacher.seniorityYears !== undefined &&
        teacher.seniorityYears < 2
      ) {
        const yearsLabel =
          teacher.seniorityYears === 1 ? '1 año' : `${teacher.seniorityYears} años`;
        alerts.push({
          id: `${teacher.id}-${alloc.code}-rn18`,
          ruleId: 'RN-18',
          severity: 'alert',
          teacherId: teacher.id,
          teacherName: teacher.fullName,
          code: alloc.code,
          title: `Antigüedad inferior a 2 años en el código ${alloc.code} (${yearsLabel})`,
          detail:
            'El Lineamiento B-20 exige al menos 2 años de vinculación en la USTA para líderes de Calidad (30411), Currículo (40106) y SEA (40109).',
        });
      }

      const unitRule = def.facultyRules?.find((r) => r.unitId === teacher.unitId);
      const matchedProgram = alloc.programId
        ? ctx.programQuotas?.find((p) => p.id === alloc.programId)
        : undefined;
      const effectiveMin =
        unitRule && unitRule.minTeacherHours !== null ? unitRule.minTeacherHours : def.baseHours;

      const effectiveMax = this.resolveEffectiveCodeCap(
        def,
        unit,
        ctx.rulesConfig,
        matchedProgram,
      );

      if (effectiveMin !== null && alloc.hours < effectiveMin) {
        alerts.push({
          id: `${teacher.id}-${alloc.code}-min`,
          ruleId: 'RN-03',
          severity: 'alert',
          teacherId: teacher.id,
          teacherName: teacher.fullName,
          code: alloc.code,
          title: `Código ${alloc.code} por debajo del mínimo (${alloc.hours} de ${effectiveMin} h)`,
          detail: unitRule
            ? `El mínimo establecido para ${unit?.name} es de ${effectiveMin} h/mes.`
            : `El Anexo 4 establece un mínimo de ${effectiveMin} h/mes para esta actividad.`,
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
          title: matchedProgram
            ? `Código ${alloc.code} supera el tope de ${matchedProgram.programName} (${alloc.hours} / ${effectiveMax} h)`
            : `Código ${alloc.code} supera el tope permitido (${alloc.hours} / ${effectiveMax} h)`,
          detail: alloc.exceptionJustification
            ? `Excepción justificada: "${alloc.exceptionJustification}"`
            : matchedProgram
              ? `Cupo del Anexo 5 para ${matchedProgram.level} (${matchedProgram.programName}): ${effectiveMax} h/mes.`
              : unitRule
                ? `Tope establecido para ${unit?.name}: ${effectiveMax} h/mes.`
                : `Tope establecido en el Anexo 4: ${effectiveMax} h/mes.`,
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
          title: `Horas SICDDI no válidas: ${alloc.hours} h registradas`,
          detail:
            'El Acuerdo 3 del 19/03/2025 establece tres niveles fijos: Nivel I (20 h), Nivel II (80 h) o Nivel III (136 h).',
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
            title: `Código ${alloc.code} sin solicitud de aval (Anexo 3)`,
            detail: `Registra ${alloc.hours} h asignadas; requiere radicar la solicitud del Anexo 3 ante Vicerrectoría Académica.`,
          });
        } else if (request.status !== 'Avalado') {
          alerts.push({
            id: `${teacher.id}-${alloc.code}-aval-pending`,
            ruleId: 'RN-09',
            severity: request.status === 'Con Observaciones' ? 'alert' : 'info',
            teacherId: teacher.id,
            teacherName: teacher.fullName,
            code: alloc.code,
            title: `Aval de Vicerrectoría en código ${alloc.code}: ${request.status}`,
            detail:
              request.viceRectorNote ??
              'Solicitud pendiente de revisión por Vicerrectoría Académica.',
          });
        }
      }
    }

    return alerts;
  }

  public static getUnitAlerts(
    unitId: string,
    ctx: ValidationContext,
    options?: ValidationOptions,
  ): ValidationAlert[] {
    const list: ValidationAlert[] = [];
    const unit = ctx.units.find((u) => u.id === unitId);
    if (!unit) return list;

    const unitTeachers = ctx.teachers.filter((t) => t.unitId === unitId);
    for (const teacher of unitTeachers) {
      list.push(...this.validateTeacher(teacher, ctx, options));
    }

    const suppressUnstartedBags =
      !options?.enforceSubmissionReadiness &&
      unit.payrollStatus === 'Borrador' &&
      WorkloadCalculatorDomain.isUnitUnstarted(ctx.teachers, unitId);

    for (const bag of WorkloadCalculatorDomain.computeUnitBagIndicators(
      unit,
      ctx.teachers,
      ctx.rulesConfig,
    )) {
      if (bag.allocated !== bag.cap && !(suppressUnstartedBags && bag.allocated === 0)) {
        list.push({
          id: `bag-${unitId}-${bag.code}`,
          ruleId: 'RN-04',
          severity: bag.allocated > bag.cap ? 'blocking' : 'alert',
          code: bag.code,
          title: `Bolsa de ${bag.title} (${bag.code}): ${bag.allocated} / ${bag.cap} h`,
          detail:
            bag.allocated > bag.cap
              ? `Supera en ${bag.allocated - bag.cap} h el tope de la unidad (${bag.source}).`
              : `Quedan ${bag.cap - bag.allocated} h por asignar en la unidad (${bag.source}).`,
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
        title: `Preparatorios de Derecho (40105) supera 120 h en la facultad (${sum40105} h)`,
        detail: 'El Anexo 4 establece un tope global de 120 h/mes para el código 40105.',
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
          'Según el Anexo 4, cualquier exceso sobre 320 h/mes requiere justificación escrita ante Vicerrectoría Académica.',
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
        title: `Examen Habilitante para Abogados (40137) asignado a ${count40137} docentes`,
        detail: 'El Anexo 4 permite un máximo de 4 docentes en el código 40137.',
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
          title: `Código ${singleCode} asignado a ${countSingle} docentes`,
          detail:
            'Según el Anexo 4, esta actividad debe concentrarse en un único docente líder por facultad.',
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
            title: `Tope de unidad en código ${codeItem.code}: ${sum} / ${unitRule.facultyBagCap} h`,
            detail: `Supera en ${sum - unitRule.facultyBagCap} h el tope autorizado para ${unitRule.unitName}.`,
          });
        }
      }
    }

    if (ctx.programQuotas && ctx.programQuotas.length > 0) {
      const unitPrograms = ctx.programQuotas.filter(
        (p) => p.unitId === unitId && p.isActive,
      );
      for (const program of unitPrograms) {
        for (const bagCode of ['30411', '40106', '40109', '40127'] as const) {
          const programCap = this.getProgramCapForSacCode(program, bagCode);
          if (programCap === null) continue;
          const programSum = unitTeachers.reduce((acc, t) => {
            const alloc = t.allocations[bagCode];
            if (alloc && alloc.programId === program.id) {
              return acc + (Number(alloc.hours) || 0);
            }
            return acc;
          }, 0);
          if (programSum > programCap) {
            list.push({
              id: `bag-program-${unitId}-${program.id}-${bagCode}`,
              ruleId: 'RN-04',
              severity: 'blocking',
              code: bagCode,
              title: `Tope del programa ${program.programName} (${bagCode}): ${programSum} / ${programCap} h`,
              detail: `Las horas asociadas a ${program.level} (${program.programName}) superan en ${programSum - programCap} h el cupo del Anexo 5.`,
            });
          }
        }
      }
    }

    return list;
  }
}
