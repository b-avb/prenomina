import * as XLSX from 'xlsx';
import type {
  AcademicUnitSummary,
  ApprovalRequestAnnex3,
  AuditLogEntry,
  FacultyTeacher,
  ProgramQuotaAnnex5,
  ResearchAllocationAnnex7,
  SacCode,
} from '@usta/domain';

export interface ExportSectionalConsolidatedParams {
  period: string;
  units: AcademicUnitSummary[];
  teachers: FacultyTeacher[];
  sacCodes: SacCode[];
  approvalRequests: ApprovalRequestAnnex3[];
  researchAllocations: ResearchAllocationAnnex7[];
  auditLogs: AuditLogEntry[];
  computeHours40104: (t: FacultyTeacher) => number;
  getEffectivePse: (t: FacultyTeacher) => number;
  computeTeacherTotalHours: (t: FacultyTeacher) => number;
  sumCodeInUnit: (unitId: string, code: string) => number;
}

export interface ExportCatalogAnnexes456Params {
  period: string;
  sacCodes: SacCode[];
  units: AcademicUnitSummary[];
  programQuotas: ProgramQuotaAnnex5[];
}

export interface ImportedAnnex5ProgramRow {
  unitName: string;
  programName: string;
  level: ProgramQuotaAnnex5['level'];
  modality: ProgramQuotaAnnex5['modality'];
  accreditationStatus: string;
  quality30411: number;
  curriculum40106: number;
  sea40109: number;
  saberPro40127: number;
  isActive: boolean;
}

export interface ImportedAnnex6UnitQuotaRow {
  unitName: string;
  division?: string;
  qualityCap30411?: number;
  curriculumCap40106?: number;
  seaCap40109?: number;
  saberProCap40127?: number;
  graduatesCap20502?: number;
}

export interface ImportedCatalogAnnexes456Result {
  sacCodes: Partial<SacCode>[];
  programs: ImportedAnnex5ProgramRow[];
  unitQuotas: ImportedAnnex6UnitQuotaRow[];
}

export class CatalogExcelService {
  public static exportSectionalConsolidatedXlsx(
    params: ExportSectionalConsolidatedParams,
  ): void {
    const {
      period,
      units,
      teachers,
      sacCodes,
      approvalRequests,
      researchAllocations,
      auditLogs,
      computeHours40104,
      getEffectivePse,
      computeTeacherTotalHours,
      sumCodeInUnit,
    } = params;

    const wb = XLSX.utils.book_new();
    const extraCodes = sacCodes.filter((c) => c.code !== '40104' && c.code !== '40108');

    const headersSac = [
      'PERIODO',
      'UNIDAD ACADÉMICA',
      'DIVISIÓN',
      'DOCUMENTO / CC',
      'NOMBRE DOCENTE',
      'DEDICACIÓN',
      'CARGA ESPERADA',
      '40104 CLASES PREGRADO',
      '40108 PSE (25%)',
      ...extraCodes.map((c) => c.code),
      'TOTAL HORAS MES',
      'HORAS COMPARTIDAS',
      'UNIDAD COMPARTIDA',
    ];

    const rowsSac = teachers.map((t) => {
      const u = units.find((item) => item.id === t.unitId);
      return [
        period,
        u?.name ?? t.unitId,
        u?.division ?? '',
        t.documentId,
        t.fullName,
        t.dedication,
        t.expectedWorkload,
        computeHours40104(t),
        getEffectivePse(t),
        ...extraCodes.map((c) => t.allocations[c.code]?.hours ?? 0),
        computeTeacherTotalHours(t),
        t.sharedHours ?? 0,
        t.sharedUnitName ?? '',
      ];
    });

    const wsSac = XLSX.utils.aoa_to_sheet([headersSac, ...rowsSac]);
    XLSX.utils.book_append_sheet(wb, wsSac, 'Sábana maestra SAC');

    const headersUnits = [
      'UNIDAD ACADÉMICA',
      'DIVISIÓN',
      'DECANO / DIRECTOR',
      'ESTADO PRENÓMINA',
      'VERSIÓN',
      'DOCENTES',
      '30411 CALIDAD (ASIG / TOPE)',
      '40106 CURRÍCULO (ASIG / TOPE)',
      '40109 SEA (ASIG / TOPE)',
      '40127 SABER PRO (ASIG / TOPE)',
      '20502 GRADUADOS (ASIG / TOPE)',
    ];
    const rowsUnits = units.map((u) => [
      u.name,
      u.division,
      u.deanName,
      u.payrollStatus,
      `Versión ${u.currentVersion}`,
      teachers.filter((t) => t.unitId === u.id).length,
      `${sumCodeInUnit(u.id, '30411')} / ${u.qualityCap30411}`,
      `${sumCodeInUnit(u.id, '40106')} / ${u.curriculumCap40106}`,
      `${sumCodeInUnit(u.id, '40109')} / ${u.seaCap40109}`,
      `${sumCodeInUnit(u.id, '40127')} / ${u.saberProCap40127}`,
      `${sumCodeInUnit(u.id, '20502')} / ${u.graduatesCap20502}`,
    ]);
    const wsUnits = XLSX.utils.aoa_to_sheet([headersUnits, ...rowsUnits]);
    XLSX.utils.book_append_sheet(
      wb,
      wsUnits,
      `Consolidado (${units.length} unidades)`.slice(0, 31),
    );

    const headersApprovals = [
      'ID',
      'FACULTAD',
      'DOCENTE',
      'CÉDULA',
      'CÓDIGO SAC',
      'ACTIVIDAD',
      'HORAS SOLICITADAS',
      'ESTADO',
      'DECIDIDO POR',
      'FECHA DECISIÓN',
      'OBSERVACIÓN',
    ];
    const rowsApprovals = approvalRequests.map((s) => [
      s.id,
      s.unitName,
      s.teacherName,
      s.teacherDocumentId,
      s.code,
      s.codeName,
      s.requestedHours,
      s.status,
      s.decidedBy ?? 'Pendiente',
      s.decidedAt ?? '—',
      s.viceRectorNote ?? '',
    ]);
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet([headersApprovals, ...rowsApprovals]),
      'Avales Anexo 3',
    );

    const headersRes = [
      'FACULTAD',
      'CÉDULA',
      'DOCENTE',
      'CÓDIGO SAC',
      'ACTIVIDAD',
      'PROYECTO O GRUPO',
      'ROL / NIVEL SICDDI',
      'HORAS SEMANA',
      'HORAS MES',
    ];
    const rowsRes = researchAllocations.map((i) => [
      i.unitName,
      i.documentId,
      i.teacherName,
      i.code,
      i.activityName,
      i.projectOrGroup,
      i.sicddiLevel ?? i.role,
      i.weeklyHours,
      i.monthlyHours,
    ]);
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet([headersRes, ...rowsRes]),
      'Investigación Anexo 7',
    );

    const headersAudit = [
      'FECHA',
      'USUARIO',
      'ROL',
      'FACULTAD',
      'DOCENTE',
      'ACCIÓN',
      'VALOR ANTERIOR',
      'VALOR NUEVO',
      'MOTIVO / JUSTIFICACIÓN',
    ];
    const formatRoleLabel = (role: AuditLogEntry['role']): string => {
      switch (role) {
        case 'director':
          return 'Dirección de Enseñanza y Aprendizaje';
        case 'vice_rector':
          return 'Vicerrectoría Académica';
        case 'research':
          return 'Dirección de Investigación';
        case 'dean':
          return 'Decanatura';
        default:
          return role;
      }
    };

    const rowsAudit = auditLogs.map((b) => [
      b.timestamp,
      b.user,
      formatRoleLabel(b.role),
      b.unitName,
      b.teacherName ?? '—',
      b.action,
      b.previousValue ?? '—',
      b.newValue ?? '—',
      b.reason ?? '',
    ]);
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet([headersAudit, ...rowsAudit]),
      'Bitácora Auditoría',
    );

    XLSX.writeFile(wb, `CONSOLIDADO_SECCIONAL_PRENOMINA_USTA_TUNJA_${period}.xlsx`);
  }

  public static exportCatalogAnnexes456Xlsx(params: ExportCatalogAnnexes456Params): void {
    const wb = XLSX.utils.book_new();

    const formatSeverityLabel = (severity: SacCode['severity']): string => {
      switch (severity) {
        case 'blocking':
          return 'Bloqueante';
        case 'justifiable_alert':
          return 'Alerta justificable';
        case 'informative':
          return 'Informativa';
      }
    };

    const h4 = [
      'CÓDIGO SAC',
      'FUNCIÓN SUSTANTIVA',
      'NOMBRE ACTIVIDAD',
      'DEFINICIÓN',
      `LINEAMIENTO ${params.period}`,
      'BASE HORAS (MÍN)',
      'TOPE HORAS (MÁX)',
      'TOPE CON POSGRADO',
      'REQUIERE AVAL V.A.',
      'CONTROL DEL TOPE',
      'APLICA A',
    ];
    const r4 = params.sacCodes.map((c) => [
      c.code,
      c.substantiveFunction,
      c.name,
      c.definition,
      c.guideline,
      c.baseHours ?? '—',
      c.capHours ?? 'Según aval',
      c.postgraduateCapHours ?? '—',
      c.requiresViceRectorApproval ? 'SÍ (ANEXO 3)' : 'NO',
      formatSeverityLabel(c.severity),
      c.appliesTo,
    ]);
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet([h4, ...r4]),
      'ANEXO 4 Catalogo SAC',
    );

    const h5 = [
      'FACULTAD',
      'PROGRAMA ACADÉMICO',
      'NIVEL',
      'MODALIDAD',
      'ESTADO ACREDITACIÓN',
      '30411 CALIDAD',
      '40106 CURRÍCULO',
      '40109 SEA',
      '40127 SABER PRO',
      'COHORTE ACTIVA',
    ];
    const r5 = params.programQuotas.map((p) => [
      p.unitName,
      p.programName,
      p.level,
      p.modality,
      p.accreditationStatus,
      p.quality30411,
      p.curriculum40106,
      p.sea40109,
      p.saberPro40127,
      p.isActive ? 'ACTIVA' : 'EXCLUIDA',
    ]);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([h5, ...r5]), 'ANEXO 5 Programas');

    const h6 = [
      'UNIDAD ACADÉMICA',
      'DIVISIÓN',
      '30411 CALIDAD',
      '40106 CURRÍCULO',
      '40109 DOCENTE SEA',
      '40127 SABER PRO',
      '20502 GRADUADOS (ANEXO 6)',
    ];
    const r6 = params.units.map((u) => [
      u.name,
      u.division,
      u.qualityCap30411,
      u.curriculumCap40106,
      u.seaCap40109,
      u.saberProCap40127,
      u.graduatesCap20502,
    ]);
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet([h6, ...r6]),
      'Consolidado ANEXOS 5 y 6',
    );

    XLSX.writeFile(wb, `PARAMETRIZACION_ANEXOS_4_5_6_USTA_${params.period}.xlsx`);
  }

  public static async importCatalogAnnexes456FromXlsx(
    file: File,
  ): Promise<ImportedCatalogAnnexes456Result> {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array' });

    const sacCodes: Partial<SacCode>[] = [];
    const programs: ImportedAnnex5ProgramRow[] = [];
    const unitQuotas: ImportedAnnex6UnitQuotaRow[] = [];

    const parseOptionalNum = (val: unknown): number | null => {
      if (val === null || val === undefined || val === '') return null;
      const str = String(val).trim();
      if (!str || str === '—' || str.toUpperCase().includes('AVAL')) return null;
      const num = Number(str);
      return Number.isFinite(num) && num >= 0 ? num : null;
    };

    for (const sheetName of wb.SheetNames) {
      const sheet = wb.Sheets[sheetName];
      if (!sheet) continue;
      const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
        header: 1,
        defval: null,
      });
      if (rows.length < 2) continue;

      const upperSheet = sheetName.toUpperCase();
      const headerRow = (rows[0] ?? []).map((cell) =>
        String(cell ?? '')
          .trim()
          .toUpperCase(),
      );
      const joinedHeader = headerRow.join(' | ');

      const isAnnex5Sheet =
        joinedHeader.includes('PROGRAMA ACAD') ||
        (upperSheet.includes('ANEXO 5') && upperSheet.includes('PROGRAMA'));
      const isAnnex6Sheet =
        !isAnnex5Sheet &&
        (joinedHeader.includes('20502') ||
          joinedHeader.includes('GRADUADOS') ||
          upperSheet.includes('CONSOLIDADO') ||
          upperSheet.includes('ANEXO 6'));
      const isAnnex4Sheet =
        !isAnnex5Sheet &&
        !isAnnex6Sheet &&
        (joinedHeader.includes('CÓDIGO') ||
          joinedHeader.includes('CODIGO') ||
          upperSheet.includes('ANEXO 4') ||
          upperSheet.includes('CATALOGO') ||
          wb.SheetNames.length === 1);

      if (isAnnex4Sheet) {
        for (let r = 1; r < rows.length; r++) {
          const row = rows[r];
          if (!row || row.length < 2) continue;
          const rawCode = String(row[0] ?? '').trim();
          if (
            !rawCode ||
            rawCode.toUpperCase().includes('CÓDIGO') ||
            rawCode.toUpperCase().includes('CODIGO')
          ) {
            continue;
          }
          const rawFn = String(row[1] ?? '').trim();
          const substantiveFunction: SacCode['substantiveFunction'] | undefined =
            rawFn === 'Enseñanza-Aprendizaje' ||
            rawFn === 'Proyección Social' ||
            rawFn === 'Investigación' ||
            rawFn === 'Gestión Académica'
              ? rawFn
              : undefined;
          const rawName = String(row[2] ?? row[1] ?? '').trim();
          const baseHours = parseOptionalNum(row[5] ?? row[3]);
          const capHours = parseOptionalNum(row[6] ?? row[4]);
          const postgraduateCapHours = parseOptionalNum(row[7]);
          const rawRequiresVa = String(row[8] ?? '').trim().toUpperCase();
          const requiresViceRectorApproval =
            rawRequiresVa !== ''
              ? rawRequiresVa.startsWith('S') ||
                rawRequiresVa === 'TRUE' ||
                rawRequiresVa === '1'
              : undefined;
          const rawSeverity = String(row[9] ?? '').trim().toLowerCase();
          const severity: SacCode['severity'] | undefined =
            rawSeverity === 'blocking' || rawSeverity.startsWith('bloq')
              ? 'blocking'
              : rawSeverity === 'justifiable_alert' ||
                  rawSeverity.includes('justific') ||
                  rawSeverity.startsWith('alert')
                ? 'justifiable_alert'
                : rawSeverity === 'informative' || rawSeverity.startsWith('inform')
                  ? 'informative'
                  : undefined;
          const rawAppliesTo = String(row[10] ?? '').trim();

          sacCodes.push({
            code: rawCode.toUpperCase(),
            ...(substantiveFunction ? { substantiveFunction } : {}),
            name: rawName ? rawName.toUpperCase() : `TUNJA ACTIVIDAD ${rawCode}`,
            ...(row[3] ? { definition: String(row[3]).trim() } : {}),
            ...(row[4] ? { guideline: String(row[4]).trim() } : {}),
            ...(baseHours !== null ? { baseHours } : {}),
            ...(capHours !== null ? { capHours } : {}),
            ...(postgraduateCapHours !== null ? { postgraduateCapHours } : {}),
            ...(requiresViceRectorApproval !== undefined
              ? { requiresViceRectorApproval }
              : {}),
            ...(severity ? { severity } : {}),
            ...(rawAppliesTo ? { appliesTo: rawAppliesTo } : {}),
          });
        }
      } else if (isAnnex5Sheet) {
        for (let r = 1; r < rows.length; r++) {
          const row = rows[r];
          if (!row || row.length < 2) continue;
          const unitName = String(row[0] ?? '').trim();
          const programName = String(row[1] ?? '').trim();
          if (
            !unitName ||
            !programName ||
            unitName.toUpperCase().includes('FACULTAD')
          ) {
            continue;
          }
          const rawLevel = String(row[2] ?? 'Pregrado').trim().toUpperCase();
          const level: ProgramQuotaAnnex5['level'] =
            rawLevel.includes('POSGRADO') ||
            rawLevel.includes('MAESTR') ||
            rawLevel.includes('ESPECIALIZ') ||
            rawLevel.includes('DOCTOR')
              ? 'Posgrado'
              : 'Pregrado';
          const rawModality = String(row[3] ?? 'Presencial').trim().toUpperCase();
          const modality: ProgramQuotaAnnex5['modality'] = rawModality.includes('VIRTUAL')
            ? 'Virtual'
            : rawModality.includes('HÍBRIDA') || rawModality.includes('HIBRIDA')
              ? 'Híbrida'
              : 'Presencial';
          const accreditationStatus =
            String(row[4] ?? '').trim() || 'Registro Calificado Vigente';
          const quality30411 = parseOptionalNum(row[5]) ?? 0;
          const curriculum40106 = parseOptionalNum(row[6]) ?? 0;
          const sea40109 = parseOptionalNum(row[7]) ?? 0;
          const saberPro40127 = parseOptionalNum(row[8]) ?? 0;
          const rawActive = String(row[9] ?? 'ACTIVA').trim().toUpperCase();
          const isActive =
            !rawActive.includes('EXCLU') &&
            rawActive !== 'NO' &&
            rawActive !== 'FALSE' &&
            rawActive !== '0';

          programs.push({
            unitName,
            programName: programName.toUpperCase(),
            level,
            modality,
            accreditationStatus,
            quality30411,
            curriculum40106,
            sea40109,
            saberPro40127,
            isActive,
          });
        }
      } else if (isAnnex6Sheet) {
        // Support both 7-column Consolidado sheet and standalone 2-column ANEXO 6 (Unidad, 20502 Graduados)
        const gradIdx = headerRow.findIndex(
          (h) => h.includes('20502') || h.includes('GRADUAD'),
        );
        const calIdx = headerRow.findIndex((h) => h.includes('30411'));
        const currIdx = headerRow.findIndex((h) => h.includes('40106'));
        const seaIdx = headerRow.findIndex((h) => h.includes('40109'));
        const saberIdx = headerRow.findIndex((h) => h.includes('40127'));
        const divIdx = headerRow.findIndex((h) => h.includes('DIVIS'));

        for (let r = 1; r < rows.length; r++) {
          const row = rows[r];
          if (!row || row.length < 2) continue;
          const unitName = String(row[0] ?? '').trim();
          if (
            !unitName ||
            unitName.toUpperCase().includes('UNIDAD') ||
            unitName.toUpperCase().includes('FACULTAD')
          ) {
            continue;
          }
          const division =
            divIdx >= 0 ? String(row[divIdx] ?? '').trim() || undefined : undefined;
          const qualityCap30411 =
            calIdx >= 0 ? (parseOptionalNum(row[calIdx]) ?? undefined) : undefined;
          const curriculumCap40106 =
            currIdx >= 0 ? (parseOptionalNum(row[currIdx]) ?? undefined) : undefined;
          const seaCap40109 =
            seaIdx >= 0 ? (parseOptionalNum(row[seaIdx]) ?? undefined) : undefined;
          const saberProCap40127 =
            saberIdx >= 0 ? (parseOptionalNum(row[saberIdx]) ?? undefined) : undefined;
          const graduatesCap20502 =
            gradIdx >= 0
              ? (parseOptionalNum(row[gradIdx]) ?? undefined)
              : (parseOptionalNum(row[1]) ?? undefined);

          unitQuotas.push({
            unitName,
            division,
            qualityCap30411,
            curriculumCap40106,
            seaCap40109,
            saberProCap40127,
            graduatesCap20502,
          });
        }
      }
    }

    return { sacCodes, programs, unitQuotas };
  }

  public static exportResearchMatrixAnnex7Xlsx(
    period: string,
    allocations: ResearchAllocationAnnex7[],
  ): void {
    const wb = XLSX.utils.book_new();
    const headers = [
      'PERIODO',
      'CÉDULA DOCENTE',
      'NOMBRE DOCENTE',
      'FACULTAD / UNIDAD ACADÉMICA',
      'CÓDIGO SAC',
      'ACTIVIDAD DE INVESTIGACIÓN',
      'PROYECTO / GRUPO / CENTRO',
      'ROL / CATEGORÍA',
      'SUBNIVEL SICDDI',
      'HORAS SEMANA',
      'HORAS MES',
      'OBSERVACIÓN',
    ];
    const rows = allocations.map((a) => [
      a.period,
      a.documentId,
      a.teacherName,
      a.unitName,
      a.code,
      a.activityName,
      a.projectOrGroup,
      a.role,
      a.sicddiLevel ?? '—',
      a.weeklyHours,
      a.monthlyHours,
      a.notes ?? '',
    ]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws['!cols'] = [
      { wch: 10 },
      { wch: 16 },
      { wch: 32 },
      { wch: 28 },
      { wch: 12 },
      { wch: 36 },
      { wch: 36 },
      { wch: 22 },
      { wch: 18 },
      { wch: 14 },
      { wch: 14 },
      { wch: 30 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'ANEXO 7 Investigacion');
    XLSX.writeFile(wb, `ANEXO_7_Matriz_Investigacion_USTA_${period}.xlsx`);
  }

  public static async importResearchMatrixAnnex7FromXlsx(
    file: File,
  ): Promise<Omit<ResearchAllocationAnnex7, 'id' | 'period'>[]> {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
      header: 1,
      defval: null,
    });

    const found: Omit<ResearchAllocationAnnex7, 'id' | 'period'>[] = [];
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length < 4) continue;
      const rawDocId = String(row[1] ?? row[0] ?? '').trim();
      const rawName = String(row[2] ?? row[1] ?? '').trim();
      if (
        !rawDocId ||
        rawDocId.toUpperCase().includes('CÉDULA') ||
        rawDocId.toUpperCase().includes('CEDULA')
      ) {
        continue;
      }
      const rawUnitName = String(row[3] ?? '').trim();
      const rawCode = String(row[4] ?? '10336').trim();
      const rawActivity = String(
        row[5] ?? 'Desarrollo de Proyectos de Investigación',
      ).trim();
      const rawProject = String(row[6] ?? 'Proyecto Convocatoria FODEIN').trim();
      const rawRole = String(row[7] ?? 'Investigador Principal').trim();
      const rawLevel = String(row[8] ?? '').trim();
      const rawMonthlyHours = Number(row[10] ?? row[8] ?? 20);
      const monthlyHours =
        Number.isFinite(rawMonthlyHours) && rawMonthlyHours > 0 ? rawMonthlyHours : 20;

      const sicddiLevel =
        rawCode === '10226'
          ? rawLevel.includes('III')
            ? 'Nivel III (136h)'
            : rawLevel.includes('II')
              ? 'Nivel II (80h)'
              : 'Nivel I (20h)'
          : null;

      found.push({
        unitId: '',
        unitName: rawUnitName,
        documentId: rawDocId,
        teacherName: rawName.toUpperCase(),
        code: rawCode,
        activityName: rawActivity,
        projectOrGroup: rawProject,
        role: rawRole,
        sicddiLevel,
        weeklyHours: Math.round((monthlyHours / 4) * 10) / 10,
        monthlyHours,
        isSicddiLocked: rawCode === '10226',
        notes: String(row[11] ?? 'Importado desde Excel ANEXO 7').trim(),
      });
    }
    return found;
  }
}

export const exportSectionalConsolidatedXlsx =
  CatalogExcelService.exportSectionalConsolidatedXlsx.bind(CatalogExcelService);
export const exportCatalogAnnexes456Xlsx =
  CatalogExcelService.exportCatalogAnnexes456Xlsx.bind(CatalogExcelService);
export const importCatalogAnnexes456FromXlsx =
  CatalogExcelService.importCatalogAnnexes456FromXlsx.bind(CatalogExcelService);
export const exportResearchMatrixAnnex7Xlsx =
  CatalogExcelService.exportResearchMatrixAnnex7Xlsx.bind(CatalogExcelService);
export const importResearchMatrixAnnex7FromXlsx =
  CatalogExcelService.importResearchMatrixAnnex7FromXlsx.bind(CatalogExcelService);
