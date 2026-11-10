<script setup lang="ts">
import { computed, onMounted, toRef } from 'vue';
import { DEFAULT_TEMPORARY_PASSWORD, type AcademicUnitSummary } from '@usta/domain';
import { usePayrollStore } from '@/stores/payroll.store';
import { useSearchFilter } from '@/composables/useSearchFilter';
import { eventChecked, eventNumber } from '@/utils/dom-events';

const emit = defineEmits<{
  newUnit: [];
  editDean: [unit: AcademicUnitSummary];
  newProgramForUnit: [unitId: string];
  openUnitPayroll: [unitId: string];
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
  return store.usersDirectory.find((u) => u.unitId === unitId);
}

async function handleResetDeanPassword(unit: AcademicUnitSummary): Promise<void> {
  const user = getDeanUser(unit.id);
  if (!user) {
    store.showToast(
      `No se encontró cuenta de usuario para ${unit.name}. Abre "Editar Decano" para crearla.`,
      'error',
    );
    return;
  }
  try {
    const res = await store.resetUserPassword(user.id, DEFAULT_TEMPORARY_PASSWORD);
    store.showToast(
      `Contraseña de @${res.user.username} (${unit.deanName}) restablecida a temporal: ${res.temporaryPassword}`,
      'success',
    );
  } catch (err) {
    store.showToast(
      err instanceof Error ? err.message : 'No fue posible restablecer la contraseña',
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
          Decanos(as), Directores(as), Usuarios de Acceso y Topes de Bolsa por Unidad Académica
        </div>
        <p style="font-size: 12px; color: var(--ink-soft); margin: 3px 0 0">
          Desde aquí Sandra puede registrar nuevas decanaturas, actualizar el Decano(a) titular, consultar su nombre de usuario y restablecer su contraseña temporal (<code>{{ DEFAULT_TEMPORARY_PASSWORD }}</code>).
        </p>
      </div>

      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
        <select
          v-model="divisionFilter"
          style="padding: 6px 10px; border: 1.5px solid var(--border); border-radius: 7px; font-size: 12px; font-weight: 700; color: var(--navy)"
        >
          <option value="TODAS">Todas las Divisiones</option>
          <option v-for="div in availableDivisions" :key="div" :value="div">
            {{ div }}
          </option>
        </select>

        <input
          v-model="deanSearchQuery"
          type="search"
          placeholder="Buscar decano, usuario, facultad o división…"
          style="padding: 6px 12px; border: 1.5px solid var(--border); border-radius: 7px; font-size: 12px; width: 260px"
        />

        <button class="btn primary small" @click="emit('newUnit')">
          + Crear Decanatura / Unidad
        </button>
      </div>
    </div>

    <table class="compact-table">
      <thead>
        <tr>
          <th>Facultad / Unidad Académica</th>
          <th>Decano(a) Titular y Usuario</th>
          <th>Programas</th>
          <th>Posgrado</th>
          <th>30411 Cal.</th>
          <th>40106 Curr.</th>
          <th>40109 SEA</th>
          <th>40127 S.Pro</th>
          <th>20502 Grad.</th>
          <th style="text-align: right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="unit in filteredUnits" :key="unit.id">
          <td>
            <b style="color: var(--navy); font-size: 13px">{{ unit.name }}</b>
            <div style="font-size: 10.5px; color: var(--ink-soft)">
              {{ unit.division }} · {{ unit.unitType }}
            </div>
          </td>
          <td>
            <div style="font-weight: 700; color: var(--ink); font-size: 12.5px">
              {{ unit.deanName }}
            </div>
            <div
              style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 2px"
            >
              <code
                v-if="getDeanUser(unit.id)"
                style="font-size: 10.5px; font-weight: 700; color: var(--navy); background: var(--surface-soft); padding: 1px 6px; border-radius: 4px"
              >
                @{{ getDeanUser(unit.id)?.username }}
              </code>
              <span
                v-if="getDeanUser(unit.id)"
                class="badge"
                :class="getDeanUser(unit.id)?.mustChangePassword ? 'observado' : 'avalado'"
                style="font-size: 9px; padding: 1px 6px"
              >
                {{
                  getDeanUser(unit.id)?.mustChangePassword
                    ? 'Clave Temporal'
                    : 'Clave Personal'
                }}
              </span>
              <span style="font-size: 10.5px; color: var(--ink-soft)">
                · CC {{ getExecutiveTeacher(unit.id)?.documentId ?? '—' }} ·
                {{ store.countUnitTeachers(unit.id) }} doc.
              </span>
            </div>
          </td>
          <td>
            <span class="badge inscrito">{{ countUnitPrograms(unit.id) }} prog.</span>
          </td>
          <td>
            <label class="toggle">
              <input
                :checked="unit.hasPostgraduates"
                type="checkbox"
                @change="store.updateUnit(unit.id, { hasPostgraduates: eventChecked($event) })"
              />
              <span class="toggle__track"></span>
            </label>
          </td>
          <td>
            <input
              :value="unit.qualityCap30411"
              type="number"
              min="0"
              max="200"
              step="4"
              style="width: 58px; padding: 3px 6px; border: 1.5px solid var(--border); border-radius: 6px; font-family: var(--font-mono); font-weight: 700"
              @change="store.updateUnit(unit.id, { qualityCap30411: eventNumber($event) })"
            />
          </td>
          <td>
            <input
              :value="unit.curriculumCap40106"
              type="number"
              min="0"
              max="200"
              step="4"
              style="width: 58px; padding: 3px 6px; border: 1.5px solid var(--border); border-radius: 6px; font-family: var(--font-mono); font-weight: 700"
              @change="store.updateUnit(unit.id, { curriculumCap40106: eventNumber($event) })"
            />
          </td>
          <td>
            <input
              :value="unit.seaCap40109"
              type="number"
              min="0"
              max="100"
              step="4"
              style="width: 58px; padding: 3px 6px; border: 1.5px solid var(--border); border-radius: 6px; font-family: var(--font-mono); font-weight: 700"
              @change="store.updateUnit(unit.id, { seaCap40109: eventNumber($event) })"
            />
          </td>
          <td>
            <input
              :value="unit.saberProCap40127"
              type="number"
              min="0"
              max="100"
              step="4"
              style="width: 58px; padding: 3px 6px; border: 1.5px solid var(--border); border-radius: 6px; font-family: var(--font-mono); font-weight: 700"
              @change="store.updateUnit(unit.id, { saberProCap40127: eventNumber($event) })"
            />
          </td>
          <td>
            <input
              :value="unit.graduatesCap20502"
              type="number"
              min="0"
              max="64"
              step="4"
              style="width: 58px; padding: 3px 6px; border: 1.5px solid var(--border); border-radius: 6px; font-family: var(--font-mono); font-weight: 700"
              @change="store.updateUnit(unit.id, { graduatesCap20502: eventNumber($event) })"
            />
          </td>
          <td style="text-align: right">
            <div
              style="display: inline-flex; gap: 5px; flex-wrap: wrap; justify-content: flex-end"
            >
              <button
                class="btn ghost small"
                title="Cambiar o actualizar los datos del Decano(a) titular y su usuario"
                @click="emit('editDean', unit)"
              >
                Editar Decano
              </button>
              <button
                class="btn ghost small"
                title="Restablecer la contraseña del Decano(a) a la clave temporal inicial (Usta2026*)"
                @click="handleResetDeanPassword(unit)"
              >
                Restablecer Clave
              </button>
              <button
                class="btn accent small"
                title="Crear un nuevo programa de Pregrado o Posgrado en esta facultad"
                @click="emit('newProgramForUnit', unit.id)"
              >
                + Programa
              </button>
              <button
                class="btn primary small"
                title="Abrir la sábana de prenómina de esta facultad"
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
