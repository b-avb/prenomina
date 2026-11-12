import * as XLSX from 'xlsx';
import {
  EXPECTED_WORKLOAD_BY_DEDICATION,
  type AcademicUnitSummary,
  type FacultyTeacher,
  type ImportedTeacherDto,
  type SacCode,
  type TeacherDedication,
} from '@usta/domain';

type ImportedAcademicSpace = ImportedTeacherDto['academicSpaces'][number];

export interface ExportAnnex2Params {
  period: string;
  unit: AcademicUnitSummary;
  teachers: FacultyTeacher[];
  sacCodes: SacCode[];
  computeHours40104: (t: FacultyTeacher) => number;
  getEffectivePse: (t: FacultyTeacher) => number;
  computeTeacherTotalHours: (t: FacultyTeacher) => number;
  sumCodeInUnit: (unitId: string, code: string) => number;
  bags: {
    code: string;
    fullTitle: string;
    source: string;
    allocated: number;
    cap: number;
    status: string;
  }[];
}

export class Annex2ExcelService {
  public static exportFacultyAnnex2Xlsx(params: ExportAnnex2Params): void {
    const {
      period,
      unit,
      teachers,
      sacCodes,
      computeHours40104,
      getEffectivePse,
      computeTeacherTotalHours,
      sumCodeInUnit,
      bags,
    } = params;

    const wb = XLSX.utils.book_new();
    const extraCodes = sacCodes.filter((c) => c.code !== '40104' && c.code !== '40108');

    // ==================== SHEET 1: PAYROLL PROJECTION ====================
    const headerMeta = [
      ['UNIVERSIDAD SANTO TOMÁS - SECCIONAL TUNJA'],
      ['VICERRECTORÍA ACADÉMICA · DIRECCIÓN DE ENSEÑANZA Y APRENDIZAJE'],
      [
        `ANEXO 2. PROYECCIÓN DE NÓMINA ACADÉMICA Y PLANES DE TRABAJO DOCENTE — PERIODO ${period}`,
      ],
      [
        `UNIDAD ACADÉMICA: ${unit.name.toUpperCase()}`,
        `DIVISIÓN: ${unit.division}`,
        `ESTADO: ${unit.payrollStatus} (Versión ${unit.currentVersion})`,
        `FECHA: ${unit.updatedAt}`,
      ],
      [],
    ];

    const tableHeaders = [
      'N°',
      'DOCUMENTO / CC',
      'NOMBRES Y APELLIDOS DEL DOCENTE',
      'DEDICACIÓN',
      'ESCALAFÓN',
      'FORMACIÓN ACADÉMICA',
      'CARGA ESPERADA (H/MES)',
      '40104 - ORIENTACIÓN ESPACIOS PREGRADO',
      '40108 - PSE (25%)',
      ...extraCodes.map((c) => `${c.code} - ${c.name.replace('TUNJA ', '')}`),
      'TOTAL HORAS MES',
      'DIFERENCIA VS CARGA',
      'HORAS COMPARTIDAS',
      'UNIDAD COMPARTIDA',
      'OBSERVACIONES / TRAZABILIDAD',
    ];

    const teacherRows = teachers.map((t, idx) => {
      const h40104 = computeHours40104(t);
      const pse = getEffectivePse(t);
      const total = computeTeacherTotalHours(t);
      return [
        idx + 1,
        t.documentId,
        t.fullName,
        t.dedication,
        t.rank,
        t.education,
        t.expectedWorkload,
        h40104,
        pse,
        ...extraCodes.map((c) => t.allocations[c.code]?.hours ?? 0),
        total,
        total - t.expectedWorkload,
        t.sharedHours ?? 0,
        t.sharedUnitName ?? '',
        t.generalNote ?? '',
      ];
    });

    const totalExpected = teachers.reduce((a, t) => a + t.expectedWorkload, 0);
    const grandTotal = teachers.reduce((a, t) => a + computeTeacherTotalHours(t), 0);
    const totalShared = teachers.reduce((a, t) => a + (t.sharedHours ?? 0), 0);

    const totalsRow = [
      '',
      '',
      `TOTALES ${unit.name.toUpperCase()} (${teachers.length} DOCENTES)`,
      '',
      '',
      '',
      totalExpected,
      sumCodeInUnit(unit.id, '40104'),
      sumCodeInUnit(unit.id, '40108'),
      ...extraCodes.map((c) => sumCodeInUnit(unit.id, c.code)),
      grandTotal,
      grandTotal - totalExpected,
      totalShared,
      '',
      '',
    ];

    const ws1Data = [...headerMeta, tableHeaders, ...teacherRows, totalsRow];
    const ws1 = XLSX.utils.aoa_to_sheet(ws1Data);
    ws1['!cols'] = [
      { wch: 5 },
      { wch: 15 },
      { wch: 36 },
      { wch: 12 },
      { wch: 22 },
      { wch: 38 },
      { wch: 14 },
      { wch: 16 },
      { wch: 14 },
      ...extraCodes.map(() => ({ wch: 14 })),
      { wch: 16 },
      { wch: 14 },
      { wch: 16 },
      { wch: 24 },
      { wch: 40 },
    ];
    XLSX.utils.book_append_sheet(wb, ws1, 'Proyección de Nómina');

    // ==================== SHEET 2: ACADEMIC SPACES ====================
    const ws2Headers = [
      'N° DOCENTE',
      'DOCUMENTO / CC',
      'NOMBRE DEL DOCENTE',
      'DEDICACIÓN',
      'ESPACIO ACADÉMICO ASIGNADO',
      'NIVEL (PREGRADO / POSGRADO)',
      'CÓDIGO SAC',
      'HORAS AL MES',
      'EQUIVALENCIA PSE (25% - 40108)',
    ];

    const ws2Rows: (string | number)[][] = [];
    teachers.forEach((t, idx) => {
      if (t.academicSpaces.length === 0) {
        ws2Rows.push([
          idx + 1,
          t.documentId,
          t.fullName,
          t.dedication,
          'SIN ESPACIOS ACADÉMICOS EN 40104',
          '—',
          '—',
          0,
          0,
        ]);
      } else {
        t.academicSpaces.forEach((space) => {
          ws2Rows.push([
            idx + 1,
            t.documentId,
            t.fullName,
            t.dedication,
            space.name,
            space.level,
            space.level === 'Pregrado' ? '40104' : '40006',
            space.monthlyHours,
            space.level === 'Pregrado'
              ? Math.round(space.monthlyHours * 0.25 * 10) / 10
              : 0,
          ]);
        });
      }
    });

    const ws2 = XLSX.utils.aoa_to_sheet([
      [`DESGLOSE DE ESPACIOS ACADÉMICOS — ${unit.name.toUpperCase()} (${period})`],
      [],
      ws2Headers,
      ...ws2Rows,
    ]);
    ws2['!cols'] = [
      { wch: 10 },
      { wch: 16 },
      { wch: 34 },
      { wch: 12 },
      { wch: 44 },
      { wch: 18 },
      { wch: 12 },
      { wch: 14 },
      { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(wb, ws2, 'Espacios Académicos');

    // ==================== SHEET 3: SUMMARY ====================
    let sumTeaching =
      sumCodeInUnit(unit.id, '40104') + sumCodeInUnit(unit.id, '40108');
    let sumOutreach = 0;
    let sumResearch = 0;
    let sumManagement = 0;

    for (const c of extraCodes) {
      const h = sumCodeInUnit(unit.id, c.code);
      if (c.substantiveFunction === 'Enseñanza-Aprendizaje') sumTeaching += h;
      else if (c.substantiveFunction === 'Proyección Social') sumOutreach += h;
      else if (c.substantiveFunction === 'Investigación') sumResearch += h;
      else if (c.substantiveFunction === 'Gestión Académica') sumManagement += h;
    }

    const rawSummaryTotal = sumTeaching + sumOutreach + sumResearch + sumManagement;
    const summaryPct = (hours: number) =>
      rawSummaryTotal > 0 ? `${Math.round((hours / rawSummaryTotal) * 1000) / 10}%` : '0%';

    const ws3Data = [
      [
        `RESUMEN CONSOLIDADO POR FUNCIÓN SUSTANTIVA Y BOLSAS — ${unit.name.toUpperCase()}`,
      ],
      [`PERIODO ACADÉMICO: ${period}`],
      [],
      ['1. DISTRIBUCIÓN DE HORAS POR FUNCIÓN SUSTANTIVA'],
      ['FUNCIÓN SUSTANTIVA', 'HORAS AL MES', 'PARTICIPACIÓN (%)'],
      [
        'Enseñanza y Aprendizaje (Incluye 40104 y 40108 PSE)',
        sumTeaching,
        summaryPct(sumTeaching),
      ],
      [
        'Proyección Social y Extensión Universitaria',
        sumOutreach,
        summaryPct(sumOutreach),
      ],
      [
        'Investigación e Innovación (Proyectos, SICDDI, Opciones de Grado)',
        sumResearch,
        summaryPct(sumResearch),
      ],
      [
        'Gestión Académica y Aseguramiento de la Calidad',
        sumManagement,
        summaryPct(sumManagement),
      ],
      [
        'TOTAL HORAS PROYECTADAS EN LA FACULTAD',
        grandTotal,
        grandTotal > 0 ? '100%' : '0%',
      ],
      [],
      ['2. CONTROL DE BOLSAS SEMESTRALES (ANEXO 5 Y ANEXO 6)'],
      [
        'CÓDIGO SAC',
        'BOLSA INSTITUCIONAL',
        'FUENTE OFICIAL',
        'HORAS ASIGNADAS',
        'TOPE FACULTAD',
        'ESTADO',
      ],
      ...bags.map((b) => [
        b.code,
        b.fullTitle,
        b.source,
        b.allocated,
        b.cap,
        b.allocated === b.cap
          ? 'CUMPLE EXACTO'
          : b.allocated > b.cap
            ? `EXCEDE POR +${b.allocated - b.cap} H`
            : `FALTAN ${b.cap - b.allocated} H`,
      ]),
    ];

    const ws3 = XLSX.utils.aoa_to_sheet(ws3Data);
    ws3['!cols'] = [
      { wch: 48 },
      { wch: 32 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 24 },
    ];
    XLSX.utils.book_append_sheet(wb, ws3, 'Resumen');

    XLSX.writeFile(wb, `ANEXO_2_Prenomina_${unit.id}_${period}.xlsx`);
  }

  /** Parses an Annex 2 workbook into id-less rows; identifiers are assigned by the server. */
  public static async importAnnex2FromXlsx(
    file: File,
    catalogCodes: SacCode[],
  ): Promise<ImportedTeacherDto[]> {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array' });

    const sheetName =
      wb.SheetNames.find((n) => n.toLowerCase().includes('proyecc')) ?? wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
      header: 1,
      defval: null,
    });

    let headerRowIdx = -1;
    const colToCode: Record<number, string> = {};
    let colDocId = 1;
    let colName = 2;
    const colDedication = 3;
    const colRank = 4;
    const colEducation = 5;
    const validCodesSet = new Set(catalogCodes.map((c) => c.code));

    for (let r = 0; r < Math.min(rows.length, 20); r++) {
      const row = rows[r];
      if (!row) continue;
      for (let c = 0; c < row.length; c++) {
        const val = String(row[c] ?? '').trim();
        const tokens = val.match(/\b[A-Za-z0-9]{4,8}\b/g) ?? [];
        const matchedCatalogCode = tokens.find(
          (token) => validCodesSet.has(token) || token === '40104' || token === '40108',
        );
        const fallbackMatch = val.match(/\b(\d{5})\b/);
        const resolvedCode = matchedCatalogCode ?? fallbackMatch?.[1];
        if (resolvedCode) {
          colToCode[c] = resolvedCode;
          headerRowIdx = r;
        }
        if (
          val.toUpperCase().includes('DOCUMENTO') ||
          val.toUpperCase() === 'C.C' ||
          val.toUpperCase() === 'CC'
        ) {
          colDocId = c;
        }
        if (val.toUpperCase().includes('NOMBRES') || val.toUpperCase().includes('DOCENTE')) {
          colName = c;
        }
      }
    }

    if (headerRowIdx === -1) {
      throw new Error(
        'El archivo no contiene columnas con códigos SAC (p. ej., 40104, 40108).',
      );
    }

    const spacesSheetName = wb.SheetNames.find((n) => n.toLowerCase().includes('espacio'));
    const spacesByTeacherName: Record<string, ImportedAcademicSpace[]> = {};
    if (spacesSheetName) {
      const wsSpaces = wb.Sheets[spacesSheetName];
      const spaceRows = XLSX.utils.sheet_to_json<(string | number | null)[]>(wsSpaces, {
        header: 1,
        defval: null,
      });
      for (let r = 1; r < spaceRows.length; r++) {
        const row = spaceRows[r];
        if (!row || row.length < 5) continue;
        const maybeTeacher = String(row[2] ?? row[1] ?? '').trim().toUpperCase();
        const maybeCourse = String(row[4] ?? row[2] ?? '').trim();
        const maybeHours = Number(row[7] ?? row[3] ?? 0);
        if (
          maybeTeacher &&
          maybeCourse &&
          !maybeCourse.toUpperCase().includes('ESPACIO') &&
          maybeHours > 0
        ) {
          if (!spacesByTeacherName[maybeTeacher]) {
            spacesByTeacherName[maybeTeacher] = [];
          }
          spacesByTeacherName[maybeTeacher].push({
            name: maybeCourse,
            level: String(row[5] ?? 'Pregrado').includes('Posgrado')
              ? 'Posgrado'
              : 'Pregrado',
            monthlyHours: maybeHours,
          });
        }
      }
    }

    const result: ImportedTeacherDto[] = [];

    for (let r = headerRowIdx + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row) continue;

      const rawName = String(row[colName] ?? '').trim();
      const rawDocId = String(row[colDocId] ?? '').trim();

      if (
        !rawName ||
        rawName.toUpperCase().includes('TOTAL') ||
        rawName.toUpperCase().includes('NOMBRES') ||
        rawName.toUpperCase().includes('DOCENTE')
      ) {
        continue;
      }

      let h40104 = 0;
      let h40108: number | null = null;
      const allocations: Record<string, { code: string; hours: number }> = {};

      for (const [colStr, code] of Object.entries(colToCode)) {
        const cIdx = Number(colStr);
        const val = Number(row[cIdx] ?? 0);
        if (!Number.isFinite(val) || val <= 0) continue;

        if (code === '40104') {
          h40104 = val;
        } else if (code === '40108') {
          h40108 = val;
        } else if (validCodesSet.has(code)) {
          allocations[code] = { code, hours: val };
        }
      }

      const has30222 = (allocations['30222']?.hours ?? 0) > 0;
      const rawDed = String(row[colDedication] ?? '').toUpperCase();
      const dedication: TeacherDedication = has30222
        ? 'DIRECTIVO'
        : rawDed === 'MT' || rawName.toUpperCase().includes('MT')
          ? 'MT'
          : rawDed === 'CATEDRA'
            ? 'CATEDRA'
            : 'TC';

      const academicSpaces = spacesByTeacherName[rawName.toUpperCase()] ?? [];
      if (academicSpaces.length === 0 && h40104 > 0) {
        academicSpaces.push({
          name: 'ESPACIOS ACADÉMICOS IMPORTADOS (40104)',
          level: 'Pregrado',
          monthlyHours: h40104,
        });
      }

      const pse25 = Math.round(h40104 * 0.25 * 10) / 10;
      const pseManualOverride =
        h40108 !== null && Math.abs(h40108 - pse25) > 0.01 ? h40108 : null;

      result.push({
        documentId: rawDocId || `VACANTE-${r}`,
        fullName: rawName.toUpperCase(),
        dedication,
        expectedWorkload: EXPECTED_WORKLOAD_BY_DEDICATION[dedication],
        rank: String(row[colRank] ?? 'Categoría 2 (Asistente)'),
        education: String(row[colEducation] ?? 'Profesional / Magíster'),
        isProvisional: !rawDocId || rawName.toUpperCase().includes('PENDIENTE'),
        seniorityYears: 4,
        pseManualOverride,
        academicSpaces,
        allocations,
      });
    }

    return result;
  }
}

export const exportFacultyAnnex2Xlsx =
  Annex2ExcelService.exportFacultyAnnex2Xlsx.bind(Annex2ExcelService);
export const importAnnex2FromXlsx =
  Annex2ExcelService.importAnnex2FromXlsx.bind(Annex2ExcelService);
