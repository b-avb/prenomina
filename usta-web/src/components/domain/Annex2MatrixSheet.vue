<script setup lang="ts">
import { computed } from 'vue';
import type { FacultyTeacher } from '@usta/domain';
import { usePayrollStore } from '@/stores/payroll.store';

const emit = defineEmits<{
  (e: 'selectTeacher', teacherId: string): void;
  (e: 'exportExcel'): void;
}>();

const store = usePayrollStore();

const DEDICATED_BAG_COLUMNS = new Set([
  '40104',
  '40108',
  '40106',
  '40109',
  '40127',
  '30411',
  '20502',
]);

const researchCodes = computed<string[]>(() =>
  store.sacCodes
    .filter(
      (c) =>
        c.substantiveFunction === 'Investigación' && !DEDICATED_BAG_COLUMNS.has(c.code),
    )
    .map((c) => c.code),
);

const researchCodeSet = computed<Set<string>>(() => new Set(researchCodes.value));

const unitResearchTotal = computed<number>(() =>
  researchCodes.value.reduce(
    (acc, code) => acc + store.sumCodeInUnit(store.activeUnit.id, code),
    0,
  ),
);

function computeTeacherResearchHours(teacher: FacultyTeacher): number {
  return researchCodes.value.reduce(
    (acc, code) => acc + (teacher.allocations[code]?.hours ?? 0),
    0,
  );
}

function computeTeacherOtherHours(teacher: FacultyTeacher): number {
  return Object.values(teacher.allocations)
    .filter((a) => !DEDICATED_BAG_COLUMNS.has(a.code) && !researchCodeSet.value.has(a.code))
    .reduce((acc, x) => acc + x.hours, 0);
}
</script>

<template>
  <div class="card">
    <div
      style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px"
    >
      <div>
        <div class="section-label" style="margin: 0">
          Sábana Consolidada en Formato ANEXO 2 — {{ store.activeUnit.name }}
        </div>
        <p style="font-size: 12px; color: var(--ink-soft); margin: 3px 0 0">
          Haz clic sobre cualquier docente para abrir su ficha detallada.
        </p>
      </div>
      <button class="btn primary small" type="button" @click="emit('exportExcel')">
        ↓ Descargar Libro ANEXO 2 (.xlsx con 3 hojas)
      </button>
    </div>

    <table class="compact-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Cédula</th>
          <th>Docente</th>
          <th>Ded.</th>
          <th>40104 Clases</th>
          <th>40108 PSE</th>
          <th>40106 Curr.</th>
          <th>40109 SEA</th>
          <th>40127 S.Pro</th>
          <th>30411 Cal.</th>
          <th>20502 Grad.</th>
          <th>Investigación</th>
          <th>Otros</th>
          <th>TOTAL MES</th>
        </tr>
      </thead>
      <tbody>
        <tr
          style="background: var(--surface-soft); font-family: var(--font-mono); font-weight: 700; color: var(--navy)"
        >
          <td colspan="4">TOTALES {{ store.activeUnit.name.toUpperCase() }}</td>
          <td>{{ store.sumCodeInUnit(store.activeUnit.id, '40104') }} h</td>
          <td>{{ store.sumCodeInUnit(store.activeUnit.id, '40108') }} h</td>
          <td>{{ store.sumCodeInUnit(store.activeUnit.id, '40106') }} h</td>
          <td>{{ store.sumCodeInUnit(store.activeUnit.id, '40109') }} h</td>
          <td>{{ store.sumCodeInUnit(store.activeUnit.id, '40127') }} h</td>
          <td>{{ store.sumCodeInUnit(store.activeUnit.id, '30411') }} h</td>
          <td>{{ store.sumCodeInUnit(store.activeUnit.id, '20502') }} h</td>
          <td>{{ unitResearchTotal }} h</td>
          <td>—</td>
          <td>
            {{
              store.activeUnitTeachers.reduce(
                (acc, t) => acc + store.computeTeacherTotalHours(t),
                0,
              )
            }}
            h
          </td>
        </tr>
        <tr v-for="(t, idx) in store.activeUnitTeachers" :key="t.id">
          <td>{{ idx + 1 }}</td>
          <td style="font-family: var(--font-mono)">{{ t.documentId }}</td>
          <td>
            <b
              style="color: var(--navy); cursor: pointer"
              @click="emit('selectTeacher', t.id)"
            >
              {{ t.fullName }}
            </b>
            <div v-if="t.sharedHours" style="font-size: 10.5px; color: var(--blue)">
              Compartido: {{ t.sharedHours }}h ({{ t.sharedUnitName }})
            </div>
          </td>
          <td>{{ t.dedication }}</td>
          <td style="font-family: var(--font-mono); font-weight: 700">
            {{ store.computeHours40104(t) }}
          </td>
          <td style="font-family: var(--font-mono); color: var(--success); font-weight: 700">
            {{ store.getEffectivePse(t) }}
          </td>
          <td style="font-family: var(--font-mono)">{{ t.allocations['40106']?.hours ?? 0 }}</td>
          <td style="font-family: var(--font-mono)">{{ t.allocations['40109']?.hours ?? 0 }}</td>
          <td style="font-family: var(--font-mono)">{{ t.allocations['40127']?.hours ?? 0 }}</td>
          <td style="font-family: var(--font-mono)">{{ t.allocations['30411']?.hours ?? 0 }}</td>
          <td style="font-family: var(--font-mono)">{{ t.allocations['20502']?.hours ?? 0 }}</td>
          <td style="font-family: var(--font-mono)">
            {{ computeTeacherResearchHours(t) }}
          </td>
          <td style="font-family: var(--font-mono)">
            {{ computeTeacherOtherHours(t) }}
          </td>
          <td>
            <span
              class="badge"
              :class="
                store.computeTeacherTotalHours(t) === t.expectedWorkload
                  ? 'aprobado'
                  : 'reprobado'
              "
            >
              {{ store.computeTeacherTotalHours(t) }} / {{ t.expectedWorkload }} h
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
