<script setup lang="ts">
/**
 * Interactive strip of Annex 5 and Annex 6 unit quota pills showing allocated vs. cap hours and
 * toggling teacher-list filtering by SAC code.
 */
import type { FacultyBagIndicator } from '@usta/domain';

defineProps<{
  bags: FacultyBagIndicator[];
  activeCode?: string | null;
}>();

const emit = defineEmits<{
  (e: 'select', code: string): void;
}>();
</script>

<template>
  <div class="bolsas-strip">
    <div
      v-for="bag in bags"
      :key="bag.code"
      class="bolsa-pill"
      :class="[bag.status, { 'active-filter': activeCode === bag.code }]"
      title="Filtrar docentes con horas en este código"
      @click="emit('select', bag.code)"
    >
      <div class="bolsa-pill__row1">
        <span class="bolsa-pill__title">{{ bag.fullTitle }}</span>
        <span class="bolsa-pill__code">{{ bag.code }}</span>
      </div>
      <div class="bolsa-pill__row2">
        <b>{{ bag.allocated }} / {{ bag.cap }} h</b>
        <span
          :style="{
            color:
              bag.status === 'ok'
                ? 'var(--success)'
                : bag.status === 'pending'
                  ? 'var(--ink-soft)'
                  : bag.status === 'warn'
                    ? 'var(--warning)'
                    : 'var(--danger)',
          }"
        >
          {{
            bag.status === 'ok'
              ? 'Cumple'
              : bag.status === 'pending'
                ? 'Sin asignar'
                : bag.status === 'warn'
                  ? `Faltan ${bag.cap - bag.allocated} h`
                  : `Excede ${bag.allocated - bag.cap} h`
          }}
        </span>
      </div>
    </div>
  </div>
</template>
