import type {
  AcademicUnitSummary,
  BusinessRulesConfig,
  FacultyTeacher,
} from './types/payroll.types.js';

export interface FacultyBagIndicator {
  code: string;
  title: string;
  fullTitle: string;
  source: 'ANEXO 5' | 'ANEXO 6';
  allocated: number;
  cap: number;
  status: 'ok' | 'warn' | 'error';
}

export class WorkloadCalculatorDomain {
  public static computeHours40104(teacher: FacultyTeacher): number {
    return teacher.academicSpaces
      .filter((s) => s.level === 'Pregrado')
      .reduce((acc, item) => acc + (Number(item.monthlyHours) || 0), 0);
  }

  public static computeHours40006(teacher: FacultyTeacher): number {
    const fromSpaces = teacher.academicSpaces
      .filter((s) => s.level === 'Posgrado')
      .reduce((acc, item) => acc + (Number(item.monthlyHours) || 0), 0);
    const fromCode = teacher.allocations['40006']?.hours ?? 0;
    return fromSpaces > 0 ? fromSpaces : fromCode;
  }

  public static computeExactPse25(
    teacher: FacultyTeacher,
    rules: BusinessRulesConfig,
  ): number {
    if (teacher.dedication === 'CATEDRA') return 0;
    const h40104 = this.computeHours40104(teacher);
    const h40006 = rules.includePostgraduateInPse125 ? this.computeHours40006(teacher) : 0;
    return Math.round((h40104 * 0.25 + h40006 * 0.125) * 10) / 10;
  }

  public static getEffectivePse(
    teacher: FacultyTeacher,
    rules: BusinessRulesConfig,
  ): number {
    if (teacher.dedication === 'CATEDRA') return 0;
    if (teacher.pseManualOverride !== undefined && teacher.pseManualOverride !== null) {
      return teacher.pseManualOverride;
    }
    return this.computeExactPse25(teacher, rules);
  }

  public static computeOtherSacHours(teacher: FacultyTeacher): number {
    return Object.values(teacher.allocations).reduce((acc, a) => {
      if (a.code === '40104' || a.code === '40108') return acc;
      return acc + (Number(a.hours) || 0);
    }, 0);
  }

  public static computeTeacherTotalHours(
    teacher: FacultyTeacher,
    rules: BusinessRulesConfig,
  ): number {
    const h40104 = this.computeHours40104(teacher);
    const pse = this.getEffectivePse(teacher, rules);
    const otherCodes = this.computeOtherSacHours(teacher);
    return h40104 + pse + otherCodes;
  }

  public static sumCodeInUnit(
    teachers: FacultyTeacher[],
    unitId: string,
    code: string,
    rules: BusinessRulesConfig,
  ): number {
    const unitTeachers = teachers.filter((t) => t.unitId === unitId);
    return unitTeachers.reduce((acc, t) => {
      if (code === '40104') return acc + this.computeHours40104(t);
      if (code === '40108') return acc + this.getEffectivePse(t, rules);
      return acc + (t.allocations[code]?.hours ?? 0);
    }, 0);
  }

  public static computeUnitBagIndicators(
    unit: AcademicUnitSummary | undefined,
    teachers: FacultyTeacher[],
    rules: BusinessRulesConfig,
  ): FacultyBagIndicator[] {
    if (!unit) return [];
    const definitions: Omit<FacultyBagIndicator, 'status'>[] = [
      {
        code: '30411',
        title: 'Calidad',
        fullTitle: 'Aseguramiento de la Calidad',
        source: 'ANEXO 5',
        allocated: this.sumCodeInUnit(teachers, unit.id, '30411', rules),
        cap: unit.qualityCap30411,
      },
      {
        code: '40106',
        title: 'Currículo',
        fullTitle: 'Líder de Currículo',
        source: 'ANEXO 5',
        allocated: this.sumCodeInUnit(teachers, unit.id, '40106', rules),
        cap: unit.curriculumCap40106,
      },
      {
        code: '40109',
        title: 'Docente SEA',
        fullTitle: 'Pruebas Académicas SEA',
        source: 'ANEXO 5',
        allocated: this.sumCodeInUnit(teachers, unit.id, '40109', rules),
        cap: unit.seaCap40109,
      },
      {
        code: '40127',
        title: 'Saber Pro',
        fullTitle: 'Pruebas Saber Pro',
        source: 'ANEXO 5',
        allocated: this.sumCodeInUnit(teachers, unit.id, '40127', rules),
        cap: unit.saberProCap40127,
      },
      {
        code: '20502',
        title: 'Graduados',
        fullTitle: 'Gestión de Graduados',
        source: 'ANEXO 6',
        allocated: this.sumCodeInUnit(teachers, unit.id, '20502', rules),
        cap: unit.graduatesCap20502,
      },
    ];

    return definitions.map((b) => {
      let status: 'ok' | 'warn' | 'error' = 'ok';
      if (b.allocated > b.cap) status = 'error';
      else if (b.allocated < b.cap) status = 'warn';
      return { ...b, status };
    });
  }
}
