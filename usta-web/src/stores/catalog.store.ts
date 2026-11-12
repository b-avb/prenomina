import { defineStore } from 'pinia';
import { ref } from 'vue';
import type {
  BusinessRulesConfig,
  DeletedResponse,
  ImportedSacCodeRowDto,
  ImportSacCodesResponse,
  PayrollSnapshot,
  SacCode,
  UpdateRulesConfigDto,
  UpdateSacCodeDto,
} from '@usta/domain';
import { useMutation, type MutationResult } from '@/composables/useMutation';
import { DEFAULT_RULES_CONFIG, STRUCTURAL_SAC_CODES } from '@/constants/payroll.constants';
import { rulesApi, sacCodesApi } from '@/services/api';
import { useOrganizationStore } from './organization.store';
import { restoreAt } from './utils/collection.utils';

export type SacCodePatch = Omit<UpdateSacCodeDto, 'code'>;

export const useCatalogStore = defineStore('catalog', () => {
  const orgStore = useOrganizationStore();
  const { runOptimistic, runPessimistic, reject } = useMutation();

  const sacCodes = ref<SacCode[]>([]);
  const rulesConfig = ref<BusinessRulesConfig>({ ...DEFAULT_RULES_CONFIG });

  function hydrate(snapshot: Pick<PayrollSnapshot, 'sacCodes' | 'rulesConfig'>): void {
    sacCodes.value = snapshot.sacCodes;
    rulesConfig.value = snapshot.rulesConfig;
  }

  function findSacCodeIndex(code: string): number {
    return sacCodes.value.findIndex((item) => item.code === code);
  }

  function replaceSacCode(saved: SacCode): void {
    const index = findSacCodeIndex(saved.code);
    if (index >= 0) sacCodes.value[index] = saved;
  }

  function persistNewSacCode(payload: SacCode, successMessage?: string): Promise<MutationResult<SacCode>> {
    if (findSacCodeIndex(payload.code) >= 0) {
      return reject('CONFLICT', `El código ${payload.code} ya existe en el catálogo`);
    }
    return runPessimistic({
      request: () => sacCodesApi.create(payload),
      commit: (saved) => sacCodes.value.unshift(saved),
      successMessage,
    });
  }

  function createSacCode(payload: SacCode): Promise<MutationResult<SacCode>> {
    return persistNewSacCode(
      payload,
      `Código ${payload.code} (${payload.name}) agregado al catálogo`,
    );
  }

  function updateSacCode(
    code: string,
    patch: SacCodePatch,
    successMessage?: string,
  ): Promise<MutationResult<SacCode>> {
    const index = findSacCodeIndex(code);
    const current = sacCodes.value[index];
    if (!current) return reject('NOT_FOUND', `El código ${code} ya no existe en el catálogo`);

    const targetCode = patch.newCode?.trim().toUpperCase();
    if (targetCode && targetCode !== code) {
      if (STRUCTURAL_SAC_CODES.includes(code)) {
        return reject(
          'BUSINESS_RULE_VIOLATION',
          `El código ${code} hace parte de los cálculos institucionales y no puede cambiarse`,
        );
      }
      if (findSacCodeIndex(targetCode) >= 0) {
        return reject('CONFLICT', `El código ${targetCode} ya existe en el catálogo`);
      }
      return runPessimistic({
        request: () => sacCodesApi.update({ code, ...patch, newCode: targetCode }),
        commit: (saved) => {
          const prevIdx = findSacCodeIndex(code);
          if (prevIdx >= 0) {
            sacCodes.value[prevIdx] = saved;
          } else {
            replaceSacCode(saved);
          }
        },
        successMessage,
      });
    }

    const { newCode: _ignoredNewCode, ...cleanPatch } = patch;
    return runOptimistic({
      capture: () => current,
      apply: () => Object.assign(current, cleanPatch),
      request: () => sacCodesApi.update({ code, ...cleanPatch }),
      commit: replaceSacCode,
      rollback: replaceSacCode,
      successMessage,
    });
  }

  function deleteSacCode(code: string): Promise<MutationResult<DeletedResponse>> {
    if (STRUCTURAL_SAC_CODES.includes(code)) {
      return reject(
        'BUSINESS_RULE_VIOLATION',
        `El código ${code} hace parte de los cálculos institucionales y no puede eliminarse`,
      );
    }
    const index = findSacCodeIndex(code);
    const current = sacCodes.value[index];
    if (!current) return reject('NOT_FOUND', `El código ${code} ya no existe en el catálogo`);
    return runOptimistic({
      capture: () => current,
      apply: () => sacCodes.value.splice(index, 1),
      request: () => sacCodesApi.remove(code),
      rollback: (previous) => restoreAt(sacCodes.value, index, previous),
      successMessage: `Código ${code} (${current.name}) eliminado del catálogo`,
      successType: 'info',
    });
  }

  /** Applies an Annex 4 workbook atomically in a single bulk transaction. */
  function importSacCodes(
    rows: Partial<SacCode>[],
  ): Promise<MutationResult<ImportSacCodesResponse>> {
    const validRows: ImportedSacCodeRowDto[] = rows
      .filter((row): row is Partial<SacCode> & { code: string } => Boolean(row.code?.trim()))
      .map((row) => ({
        code: row.code.trim(),
        ...(row.name !== undefined ? { name: row.name } : {}),
        ...(row.substantiveFunction !== undefined
          ? { substantiveFunction: row.substantiveFunction }
          : {}),
        ...(row.definition !== undefined ? { definition: row.definition } : {}),
        ...(row.guideline !== undefined ? { guideline: row.guideline } : {}),
        ...(row.baseHours !== undefined ? { baseHours: row.baseHours } : {}),
        ...(row.capHours !== undefined ? { capHours: row.capHours } : {}),
        ...(row.postgraduateCapHours !== undefined
          ? { postgraduateCapHours: row.postgraduateCapHours }
          : {}),
        ...(row.requiresViceRectorApproval !== undefined
          ? { requiresViceRectorApproval: row.requiresViceRectorApproval }
          : {}),
        ...(row.appliesTo !== undefined ? { appliesTo: row.appliesTo } : {}),
        ...(row.severity !== undefined ? { severity: row.severity } : {}),
      }));

    if (validRows.length === 0) {
      return reject('VALIDATION_FAILED', 'El archivo no contiene códigos SAC válidos');
    }

    return runPessimistic({
      request: () => sacCodesApi.importCatalog({ rows: validRows }),
      commit: ({ codes }) => {
        sacCodes.value = codes;
      },
      successMessage: ({ updatedCount, createdCount }) =>
        `Catálogo actualizado: ${updatedCount} modificados, ${createdCount} nuevos`,
    });
  }

  function updateRulesConfig(
    patch: UpdateRulesConfigDto,
  ): Promise<MutationResult<BusinessRulesConfig>> {
    return runOptimistic({
      capture: () => rulesConfig.value,
      apply: () => Object.assign(rulesConfig.value, patch),
      request: () => rulesApi.updateConfig(orgStore.activePeriod, patch),
      commit: (saved) => {
        rulesConfig.value = saved;
      },
      rollback: (previous) => {
        rulesConfig.value = previous;
      },
    });
  }

  return {
    sacCodes,
    rulesConfig,
    hydrate,
    createSacCode,
    updateSacCode,
    deleteSacCode,
    importSacCodes,
    updateRulesConfig,
  };
});
