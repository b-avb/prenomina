<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import type { AssignedAcademicSpace, FacultyTeacher } from '@usta/domain';
import { usePayrollStore } from '@/stores/payroll.store';
import { eventNumber, eventValue } from '@/utils/dom-events';

const props = defineProps<{
  teacher: FacultyTeacher;
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
  store.addAcademicSpace(
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
          1. Espacios Académicos (40104 / 40006)
          <span
            class="code-chip"
            style="margin-left: 8px; vertical-align: middle; font-size: 10.5px"
          >
            40104: {{ store.computeHours40104(teacher) }}h · PSE (25%):
            {{ store.getEffectivePse(teacher) }}h
          </span>
        </h3>
        <p>
          {{
            teacher.academicSpaces.length === 0
              ? 'Sin asignaturas asignadas actualmente. Puedes registrar un espacio académico a la derecha:'
              : 'Suma automática de horas de orientación de clase y 25 % de PSE (40108)'
          }}
        </p>
      </div>

      <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap">
        <input
          v-model="newSpaceName"
          type="text"
          list="faculty-spaces-list"
          placeholder="Nombre de la asignatura (o clic en + Agregar)…"
          style="padding: 6px 10px; border: 1.5px solid var(--border); border-radius: 7px; font-size: 12px; min-width: 240px"
          @keyup.enter="handleAddAcademicSpace"
        />
        <datalist id="faculty-spaces-list">
          <option
            v-for="spaceOption in suggestedFacultySpaces"
            :key="spaceOption"
            :value="spaceOption"
          />
        </datalist>
        <select
          v-model="newSpaceLevel"
          style="padding: 6px 8px; border: 1.5px solid var(--border); border-radius: 7px; font-size: 12px"
        >
          <option value="Pregrado">Pregrado</option>
          <option value="Posgrado">Posgrado</option>
        </select>
        <input
          v-model.number="newSpaceHours"
          type="number"
          min="2"
          max="128"
          step="2"
          title="Horas mensuales (Pregrado) o del módulo (Posgrado)"
          style="width: 68px; padding: 6px 8px; border: 1.5px solid var(--border); border-radius: 7px; font-family: var(--font-mono); font-weight: 700; font-size: 12px"
        />
        <button class="btn primary small" @click="handleAddAcademicSpace">
          + Agregar Espacio
        </button>
      </div>
    </div>

    <table v-if="teacher.academicSpaces.length > 0" class="compact-table">
      <thead>
        <tr>
          <th>Espacio Académico (Editable)</th>
          <th>Nivel</th>
          <th>Horas/Mes (40104 / 40006)</th>
          <th>PSE Automático (25%)</th>
          <th style="text-align: right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="space in teacher.academicSpaces" :key="space.id">
          <td data-label="Espacio" style="min-width: 260px">
            <input
              :value="space.name"
              type="text"
              list="faculty-spaces-list"
              class="space-name-input"
              style="width: 100%; padding: 5px 8px; border: 1.5px solid var(--border); border-radius: 6px; font-weight: 700; font-size: 12px; color: var(--navy)"
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
              style="padding: 4px 8px; border: 1.5px solid var(--border); border-radius: 6px; font-size: 11.5px; font-weight: 700; color: var(--navy); background: #fff"
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
          <td data-label="Horas/Mes">
            <input
              :value="space.monthlyHours"
              type="number"
              min="0"
              max="64"
              step="2"
              style="width: 68px; padding: 4px 7px; border: 1.5px solid var(--border); border-radius: 6px; font-family: var(--font-mono); font-weight: 700; font-size: 12px"
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
          <td style="text-align: right">
            <button
              class="btn ghost small"
              style="padding: 2px 8px; color: var(--danger)"
              title="Quitar asignatura"
              @click="store.removeAcademicSpace(teacher.id, space.id)"
            >
              × Quitar
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
