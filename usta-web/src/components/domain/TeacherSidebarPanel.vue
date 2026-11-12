<script setup lang="ts">
import { usePayrollStore } from '@/stores/payroll.store';
import type { FacultyTeacher } from '@usta/domain';

defineProps<{
  filteredTeachers: FacultyTeacher[];
  totalUnitTeachers: number;
  activeTeacherId: string | null;
  searchQuery: string;
  statusFilter: 'all' | 'alerts' | 'ok';
  bagCodeFilter: string | null;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:searchQuery', value: string): void;
  (e: 'update:statusFilter', value: 'all' | 'alerts' | 'ok'): void;
  (e: 'update:bagCodeFilter', value: string | null): void;
  (e: 'selectTeacher', id: string): void;
  (e: 'newTeacher'): void;
}>();

const store = usePayrollStore();
</script>

<template>
  <aside class="docente-sidebar">
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px">
      <b style="color: var(--navy); font-size: 13px">
        Docentes ({{ filteredTeachers.length }}/{{ totalUnitTeachers }})
      </b>
      <button
        v-if="!readonly"
        class="btn primary small"
        type="button"
        @click="emit('newTeacher')"
      >
        Nuevo docente
      </button>
    </div>

    <div class="field field--sm" style="margin: 8px 0 6px">
      <input
        :value="searchQuery"
        type="text"
        placeholder="Buscar por nombre o cédula…"
        @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <div style="display: flex; gap: 4px">
      <button
        type="button"
        class="dia-chip"
        style="height: 26px; font-size: 11px; flex: 1; min-width: 0; padding: 0 4px"
        :class="{ active: statusFilter === 'all' && !bagCodeFilter }"
        @click="
          emit('update:statusFilter', 'all');
          emit('update:bagCodeFilter', null);
        "
      >
        Todos
      </button>
      <button
        type="button"
        class="dia-chip"
        style="height: 26px; font-size: 11px; flex: 1; min-width: 0; padding: 0 4px"
        :class="{ active: statusFilter === 'alerts' }"
        @click="emit('update:statusFilter', 'alerts')"
      >
        Alertas
      </button>
      <button
        type="button"
        class="dia-chip"
        style="height: 26px; font-size: 11px; flex: 1; min-width: 0; padding: 0 4px"
        :class="{ active: statusFilter === 'ok' }"
        @click="emit('update:statusFilter', 'ok')"
      >
        Cumple
      </button>
    </div>

    <div
      v-if="bagCodeFilter"
      style="margin-top: 6px; padding: 4px 8px; background: var(--brand-tint); border-radius: 6px; font-size: 11px; display: flex; justify-content: space-between; align-items: center"
    >
      <span>Código <b>{{ bagCodeFilter }}</b></span>
      <button
        type="button"
        style="border: none; background: transparent; cursor: pointer; font-weight: 700; color: var(--navy)"
        @click="emit('update:bagCodeFilter', null)"
      >
        Quitar
      </button>
    </div>

    <div class="docente-list">
      <div
        v-if="filteredTeachers.length === 0"
        class="empty-note"
        style="padding: 18px 8px; text-align: center; font-size: 11.5px"
      >
        Sin docentes para este filtro.
      </div>
      <div
        v-for="teacher in filteredTeachers"
        :key="teacher.id"
        class="docente-item"
        :class="{ active: activeTeacherId === teacher.id }"
        @click="emit('selectTeacher', teacher.id)"
      >
        <div class="docente-item__top">
          <div class="docente-item__name" :title="teacher.fullName">
            {{ teacher.fullName }}
          </div>
          <span
            class="badge"
            style="padding: 2px 6px; font-size: 10px; flex-shrink: 0; font-family: var(--font-mono)"
            :class="
              store.computeTeacherTotalHours(teacher) === teacher.expectedWorkload
                ? 'aprobado'
                : store.computeTeacherTotalHours(teacher) > teacher.expectedWorkload
                  ? 'reprobado'
                  : store.isTeacherUnstarted(teacher)
                    ? 'retirado'
                    : 'pendiente'
            "
          >
            {{ store.computeTeacherTotalHours(teacher) }}/{{ teacher.expectedWorkload }}h
          </span>
        </div>

        <div class="docente-item__meta">
          <span style="color: var(--ink-soft); font-size: 11px">
            {{ teacher.dedication }}
            <template v-if="teacher.isProvisional">
              · <b style="color: var(--warning)">Vacante</b>
            </template>
            <template v-else-if="teacher.sharedHours">
              · Comp. {{ teacher.sharedHours }}h
            </template>
          </span>

          <span
            v-if="
              store.versionComparisonMode &&
              teacher.version1Total &&
              teacher.version1Total !== store.computeTeacherTotalHours(teacher)
            "
            class="diff-pill"
          >
            <del>{{ teacher.version1Total }}</del
            >→<ins>{{ store.computeTeacherTotalHours(teacher) }}h</ins>
          </span>
          <span
            v-else-if="
              store.validateTeacher(teacher).some((a) => a.severity === 'blocking')
            "
            style="color: var(--danger); font-weight: 700; font-size: 10.5px"
          >
            Revisar
          </span>
          <span
            v-else-if="store.validateTeacher(teacher).some((a) => a.severity === 'alert')"
            style="color: var(--warning); font-weight: 700; font-size: 10.5px"
          >
            {{ store.validateTeacher(teacher).filter((a) => a.severity === 'alert').length }}
            {{
              store.validateTeacher(teacher).filter((a) => a.severity === 'alert').length === 1
                ? 'alerta'
                : 'alertas'
            }}
          </span>
          <span
            v-else-if="store.isTeacherUnstarted(teacher) && teacher.expectedWorkload > 0"
            style="color: var(--ink-soft); font-weight: 600; font-size: 10.5px"
          >
            Sin horas
          </span>
          <span v-else style="color: var(--success); font-weight: 700; font-size: 10.5px">
            Cumple
          </span>
        </div>
      </div>
    </div>
  </aside>
</template>
