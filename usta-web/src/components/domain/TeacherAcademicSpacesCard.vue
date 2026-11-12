<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import type { AssignedAcademicSpace, FacultyTeacher } from '@usta/domain';
import { usePayrollStore } from '@/stores/payroll.store';
import { eventNumber, eventValue } from '@/utils/dom-events';

const props = defineProps<{
  teacher: FacultyTeacher;
  readonly?: boolean;
}>();

const store = usePayrollStore();

const newSpaceName = ref('');
const newSpaceLevel = ref<'Pregrado' | 'Posgrado'>('Pregrado');
const newSpaceHours = ref<number>(16);

const suggestedFacultySpaces = computed(() => {
  const fromFaculty = store.activeUnitTeachers.flatMap((t) =>
    t.academicSpaces.map((s) => s.name),
  );
  const fromAllUnits = store.teachers.flatMap((t) =>
    t.academicSpaces.map((s) => s.name),
  );
  return Array.from(new Set([...fromFaculty, ...fromAllUnits]));
});

async function handleAddAcademicSpace() {
  if (props.readonly) return;
  let spaceName = newSpaceName.value.trim();
  const wasEmpty = !spaceName;
  if (!spaceName) {
    const existingNames = new Set(
      props.teacher.academicSpaces.map((s) => s.name.toUpperCase()),
    );
    const suggested = suggestedFacultySpaces.value.find(
      (s) => !existingNames.has(s.toUpperCase()),
    );
    spaceName =
      suggested ?? `ESPACIO ACADÉMICO #${props.teacher.academicSpaces.length + 1}`;
  }
  await store.addAcademicSpace(
    props.teacher.id,
    spaceName,
    newSpaceLevel.value,
    Number(newSpaceHours.value) || 16,
  );
  newSpaceName.value = '';
  newSpaceHours.value = 16;

  if (wasEmpty) {
    await nextTick();
    const inputs = document.querySelectorAll<HTMLInputElement>('.space-name-input');
    const lastInput = inputs[inputs.length - 1];
    if (lastInput) {
      lastInput.focus();
      lastInput.select();
    }
  }
}
</script>

<template>
  <div class="panel-card">
    <div
      class="panel-card__head"
      :style="{
        marginBottom: teacher.academicSpaces.length === 0 ? '0' : '12px',
        paddingBottom: teacher.academicSpaces.length === 0 ? '0' : '10px',
        borderBottom:
          teacher.academicSpaces.length === 0 ? 'none' : '1px solid var(--border)',
      }"
    >
      <div>
        <h3>
          Espacios académicos (40104 / 40006)
          <span
            class="code-chip"
            style="margin-left: 8px; vertical-align: middle; font-size: 10.5px"
          >
            40104: {{ store.computeHours40104(teacher) }}h<template
              v-if="store.computeHours40006(teacher) > 0"
            >
              · 40006 (Posg.): {{ store.computeHours40006(teacher) }}h</template
            >
            · PSE (25%): {{ store.getEffectivePse(teacher) }}h
          </span>
        </h3>
        <p>
          {{
            teacher.academicSpaces.length === 0
              ? readonly
                ? 'Sin espacios académicos registrados.'
                : 'Sin espacios académicos registrados. Agregue una asignatura de pregrado (40104) o módulo de posgrado (40006).'
              : 'Cálculo automático de orientación presencial y 25 % de PSE (40108).'
          }}
        </p>
      </div>

      <div
        v-if="!readonly"
        style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap"
      >
        <input
          v-model="newSpaceName"
          type="text"
          list="faculty-spaces-list"
          class="control-sm"
          :placeholder="
            newSpaceLevel === 'Posgrado'
              ? 'Nombre del seminario o módulo…'
              : 'Nombre de la asignatura…'
          "
          style="min-width: 240px"
          @keyup.enter="handleAddAcademicSpace"
        />
        <datalist id="faculty-spaces-list">
          <option
            v-for="spaceOption in suggestedFacultySpaces"
            :key="spaceOption"
            :value="spaceOption"
          />
        </datalist>
        <select v-model="newSpaceLevel" class="control-sm">
          <option value="Pregrado">Pregrado (40104)</option>
          <option value="Posgrado">Posgrado (40006)</option>
        </select>
        <input
          v-model.number="newSpaceHours"
          type="number"
          min="2"
          max="128"
          step="2"
          class="control-sm control-sm--num"
          :title="
            newSpaceLevel === 'Posgrado'
              ? 'Horas totales del módulo de posgrado (se divide entre 4 para horas/mes en 40006)'
              : 'Horas mensuales del espacio de pregrado (40104)'
          "
          style="width: 68px"
        />
        <span
          v-if="newSpaceLevel === 'Posgrado'"
          style="font-size: 10.5px; font-weight: 700; color: var(--navy); white-space: nowrap"
          title="Las horas del módulo de posgrado se dividen entre 4 semanas para calcular horas/mes en 40006"
        >
          h mód. (={{ Math.round(((Number(newSpaceHours) || 0) / 4) * 10) / 10 }}h/mes)
        </span>
        <button
          type="button"
          class="btn primary small"
          style="height: 34px"
          @click="handleAddAcademicSpace"
        >
          Agregar espacio
        </button>
      </div>
    </div>

    <table v-if="teacher.academicSpaces.length > 0" class="compact-table">
      <thead>
        <tr>
          <th>Espacio académico</th>
          <th>Nivel</th>
          <th>Horas/mes</th>
          <th>PSE (25 %)</th>
          <th v-if="!readonly" style="text-align: right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="space in teacher.academicSpaces" :key="space.id">
          <td data-label="Espacio" style="min-width: 260px">
            <input
              :value="space.name"
              type="text"
              list="faculty-spaces-list"
              :disabled="readonly"
              class="space-name-input table-input table-input--strong"
              style="width: 100%"
              @change="
                store.updateAcademicSpace(teacher.id, space.id, {
                  name: eventValue($event).trim().toUpperCase() || 'ESPACIO ACADÉMICO',
                })
              "
            />
          </td>
          <td data-label="Nivel">
            <select
              :value="space.level"
              :disabled="readonly"
              class="table-select"
              @change="
                store.updateAcademicSpace(teacher.id, space.id, {
                  level: eventValue($event) as AssignedAcademicSpace['level'],
                })
              "
            >
              <option value="Pregrado">Pregrado</option>
              <option value="Posgrado">Posgrado</option>
            </select>
          </td>
          <td data-label="Horas/mes">
            <input
              :value="space.monthlyHours"
              type="number"
              min="0"
              max="64"
              step="2"
              :disabled="readonly"
              class="table-input table-input--num"
              style="width: 68px"
              @change="
                store.updateAcademicSpace(teacher.id, space.id, {
                  monthlyHours: eventNumber($event),
                })
              "
            />
            <span style="font-size: 11px; color: var(--ink-soft); margin-left: 4px">
              h/mes
            </span>
          </td>
          <td
            data-label="PSE"
            style="font-family: var(--font-mono); font-size: 12px; color: var(--success); font-weight: 700"
          >
            {{
              space.level === 'Pregrado'
                ? `+${Math.round(space.monthlyHours * 0.25 * 10) / 10} h`
                : 'Posgrado (según regla)'
            }}
          </td>
          <td v-if="!readonly" style="text-align: right">
            <button
              type="button"
              class="btn ghost small"
              style="padding: 2px 8px; color: var(--danger)"
              title="Quitar asignatura"
              @click="store.removeAcademicSpace(teacher.id, space.id)"
            >
              Quitar
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
