<script setup lang="ts">
import { computed, onMounted, toRef } from 'vue';
import type { AcademicUnitSummary } from '@usta/domain';
import { usePayrollStore } from '@/stores/payroll.store';
import { useSearchFilter } from '@/composables/useSearchFilter';
import { eventChecked, eventNumber } from '@/utils/dom-events';

const emit = defineEmits<{
  newUnit: [];
  editDean: [unit: AcademicUnitSummary];
  newProgramForUnit: [unitId: string];
  viewProgramsForUnit: [unitId: string];
  openUnitPayroll: [unitId: string];
  issuedCredentials: [
    payload: {
      title: string;
      fullName: string;
      unitName: string;
      username: string;
      temporaryPassword: string;
    },
  ];
}>();

const store = usePayrollStore();

onMounted(() => {
  if (store.usersDirectory.length === 0) {
    void store.fetchUsersDirectory();
  }
});

const {
  searchQuery: deanSearchQuery,
  activeCategory: divisionFilter,
  filteredItems: filteredUnits,
} = useSearchFilter(toRef(store, 'units'), {
  textFields: (unit) => [
    unit.name,
    unit.deanName,
    unit.division,
    getDeanUser(unit.id)?.username ?? '',
  ],
  categoryField: (unit) => unit.division,
  allCategoriesValue: 'TODAS',
});

const availableDivisions = computed(() => {
  const set = new Set<string>();
  for (const unit of store.units) {
    if (unit.division) set.add(unit.division);
  }
  return Array.from(set);
});

function countUnitPrograms(unitId: string) {
  return store.programQuotas.filter((p) => p.unitId === unitId).length;
}

function getExecutiveTeacher(unitId: string) {
  return store.teachers.find((t) => t.unitId === unitId && t.dedication === 'DIRECTIVO');
}

function getDeanUser(unitId: string) {
  return store.usersDirectory.find(
    (u) => u.unitId === unitId || u.managedUnitIds?.includes(unitId),
  );
}

async function handleResetDeanPassword(unit: AcademicUnitSummary): Promise<void> {
  const user = getDeanUser(unit.id);
  if (!user) {
    store.showToast(
      `No se encontró usuario para ${unit.name}. Use "Editar" para crearlo.`,
      'error',
    );
    return;
  }
  try {
    const res = await store.resetUserPassword(user.id);
    emit('issuedCredentials', {
      title: 'Contraseña temporal restablecida',
      fullName: unit.deanName,
      unitName: unit.name,
      username: res.user.username,
      temporaryPassword: res.temporaryPassword,
    });
  } catch (err) {
    store.showToast(
      err instanceof Error ? err.message : 'No fue posible restablecer la contraseña.',
      'error',
    );
  }
}
</script>

<template>
  <div class="card" style="padding: 16px 18px">
    <div
      style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 14px"
    >
      <div>
        <div class="section-label" style="margin: 0">
          Decanaturas, direcciones y topes por unidad
        </div>
        <p style="font-size: 12px; color: var(--ink-soft); margin: 3px 0 0">
          Gestione titulares, cuentas de acceso, programas asociados y bolsas semestrales.
        </p>
      </div>

      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
        <select v-model="divisionFilter" class="control-sm">
          <option value="TODAS">Todas las divisiones</option>
          <option v-for="div in availableDivisions" :key="div" :value="div">
            {{ div }}
          </option>
        </select>

        <input
          v-model="deanSearchQuery"
          type="search"
          class="control-sm"
          placeholder="Buscar titular, usuario, unidad o división…"
          style="width: 260px"
        />

        <button type="button" class="btn primary small" style="height: 34px" @click="emit('newUnit')">
          Nueva unidad
        </button>
      </div>
    </div>

    <table class="compact-table">
      <thead>
        <tr>
          <th style="width: 18%">Unidad académica</th>
          <th style="width: 24%">Titular y usuario</th>
          <th class="col-center">Programas</th>
          <th class="col-center">Posgrado</th>
          <th class="col-center">30411 Cal.</th>
          <th class="col-center">40106 Curr.</th>
          <th class="col-center">40109 SEA</th>
          <th class="col-center">40127 S.Pro</th>
          <th class="col-center">20502 Grad.</th>
          <th class="col-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="filteredUnits.length === 0">
          <td colspan="10" class="empty-note" style="padding: 24px 16px; text-align: center">
            Sin unidades académicas para el criterio ingresado.
          </td>
        </tr>
        <tr v-for="unit in filteredUnits" :key="unit.id">
          <td>
            <b style="color: var(--navy); font-size: 12.5px; line-height: 1.3; display: block">
              {{ unit.name }}
            </b>
            <div style="font-size: 10.5px; color: var(--ink-soft); line-height: 1.25; margin-top: 2px">
              {{ unit.division }} · {{ unit.unitType }}
            </div>
          </td>
          <td>
            <div style="font-weight: 700; color: var(--ink); font-size: 12px; line-height: 1.3">
              {{ unit.deanName }}
            </div>
            <div
              style="display: flex; align-items: center; gap: 5px; flex-wrap: wrap; margin-top: 3px"
            >
              <code
                v-if="getDeanUser(unit.id)"
                style="font-size: 10.5px; font-weight: 700; color: var(--navy); background: var(--surface-soft); padding: 1px 6px; border-radius: 4px"
              >
                {{ getDeanUser(unit.id)?.username }}
              </code>
              <span
                v-if="getDeanUser(unit.id)"
                class="badge"
                :class="getDeanUser(unit.id)?.mustChangePassword ? 'observado' : 'avalado'"
                style="font-size: 9.5px; padding: 2px 6px; white-space: nowrap"
              >
                {{
                  getDeanUser(unit.id)?.mustChangePassword
                    ? 'Clave temporal'
                    : 'Clave activa'
                }}
              </span>
              <span style="font-size: 10.5px; color: var(--ink-soft)">
                · CC {{ getExecutiveTeacher(unit.id)?.documentId ?? '—' }} ·
                {{ store.countUnitTeachers(unit.id) }} doc.
              </span>
            </div>
          </td>
          <td class="col-center">
            <button
              type="button"
              class="badge inscrito"
              style="border: none; cursor: pointer; font-weight: 800; white-space: nowrap"
              :title="`Ver programas de ${unit.name}`"
              @click="emit('viewProgramsForUnit', unit.id)"
            >
              {{ countUnitPrograms(unit.id) }}
              {{ countUnitPrograms(unit.id) === 1 ? 'programa' : 'programas' }}
            </button>
          </td>
          <td class="col-center">
            <label class="toggle">
              <input
                :checked="unit.hasPostgraduates"
                type="checkbox"
                @change="store.updateUnit(unit.id, { hasPostgraduates: eventChecked($event) })"
              />
              <span class="toggle__track"></span>
            </label>
          </td>
          <td class="col-center">
            <input
              :value="unit.qualityCap30411"
              type="number"
              min="0"
              max="200"
              step="4"
              class="table-input table-input--num"
              style="width: 48px"
              @change="store.updateUnit(unit.id, { qualityCap30411: eventNumber($event) })"
            />
          </td>
          <td class="col-center">
            <input
              :value="unit.curriculumCap40106"
              type="number"
              min="0"
              max="200"
              step="4"
              class="table-input table-input--num"
              style="width: 48px"
              @change="store.updateUnit(unit.id, { curriculumCap40106: eventNumber($event) })"
            />
          </td>
          <td class="col-center">
            <input
              :value="unit.seaCap40109"
              type="number"
              min="0"
              max="100"
              step="4"
              class="table-input table-input--num"
              style="width: 48px"
              @change="store.updateUnit(unit.id, { seaCap40109: eventNumber($event) })"
            />
          </td>
          <td class="col-center">
            <input
              :value="unit.saberProCap40127"
              type="number"
              min="0"
              max="100"
              step="4"
              class="table-input table-input--num"
              style="width: 48px"
              @change="store.updateUnit(unit.id, { saberProCap40127: eventNumber($event) })"
            />
          </td>
          <td class="col-center">
            <input
              :value="unit.graduatesCap20502"
              type="number"
              min="0"
              max="64"
              step="4"
              class="table-input table-input--num"
              style="width: 48px"
              @change="store.updateUnit(unit.id, { graduatesCap20502: eventNumber($event) })"
            />
          </td>
          <td class="col-right">
            <div
              style="display: inline-grid; grid-template-columns: repeat(2, 1fr); gap: 5px; justify-content: end"
            >
              <button
                type="button"
                class="btn ghost small"
                style="min-height: 27px; padding: 4px 8px; font-size: 11px; white-space: nowrap"
                title="Actualizar titular y cuenta de acceso"
                @click="emit('editDean', unit)"
              >
                Editar
              </button>
              <button
                type="button"
                class="btn ghost small"
                style="min-height: 27px; padding: 4px 8px; font-size: 11px; white-space: nowrap"
                title="Generar nueva contraseña temporal"
                @click="handleResetDeanPassword(unit)"
              >
                Restablecer clave
              </button>
              <button
                type="button"
                class="btn accent small"
                style="min-height: 27px; padding: 4px 8px; font-size: 11px; white-space: nowrap"
                title="Agregar programa académico en esta unidad"
                @click="emit('newProgramForUnit', unit.id)"
              >
                Nuevo programa
              </button>
              <button
                type="button"
                class="btn primary small"
                style="min-height: 27px; padding: 4px 8px; font-size: 11px; white-space: nowrap"
                title="Abrir prenómina de esta unidad"
                @click="emit('openUnitPayroll', unit.id)"
              >
                Prenómina
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
