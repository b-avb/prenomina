<script setup lang="ts">
import { computed, ref } from 'vue';
import type { AcademicUnitSummary } from '@usta/domain';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    units: AcademicUnitSummary[];
    label?: string;
  }>(),
  {
    label: 'Unidades Académicas a las que aplica (Selección múltiple)',
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const isOpen = ref(false);

const selectedUnits = computed<string[]>(() => {
  if (!props.modelValue) return [];
  const low = props.modelValue.toLowerCase();
  return props.units
    .filter((u) => low.includes(u.name.toLowerCase()))
    .map((u) => u.name);
});

const isAllSelected = computed<boolean>(() => {
  if (!props.modelValue) return true;
  return (
    selectedUnits.value.length === 0 ||
    selectedUnits.value.length === props.units.length
  );
});

function selectAll(): void {
  emit('update:modelValue', 'Todas las unidades académicas');
}

function toggleUnit(unitName: string): void {
  const current = selectedUnits.value;
  let next: string[];
  if (current.includes(unitName)) {
    next = current.filter((n) => n !== unitName);
  } else {
    next = [...current, unitName];
  }
  if (next.length === 0 || next.length === props.units.length) {
    emit('update:modelValue', 'Todas las unidades académicas');
  } else {
    emit('update:modelValue', next.join(', '));
  }
}
</script>

<template>
  <div class="field" style="position: relative">
    <label>{{ label }}</label>
    <button
      type="button"
      style="width: 100%; text-align: left; padding: 8px 10px; border: 1.5px solid var(--border); border-radius: 7px; background: #fff; font-size: 12px; color: var(--navy); font-weight: 600; display: flex; justify-content: space-between; align-items: center; cursor: pointer"
      @click="isOpen = !isOpen"
    >
      <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
        {{
          isAllSelected
            ? `Todas las unidades académicas (${units.length})`
            : `${selectedUnits.length} unidad(es): ${modelValue}`
        }}
      </span>
      <span style="margin-left: 8px; font-size: 10px">▼</span>
    </button>

    <div
      v-if="isOpen"
      style="position: absolute; top: 100%; left: 0; right: 0; z-index: 40; background: #fff; border: 1.5px solid var(--navy); border-radius: 8px; box-shadow: 0 8px 24px rgba(0, 26, 67, 0.18); max-height: 210px; overflow-y: auto; padding: 6px; margin-top: 4px"
    >
      <label
        style="display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-bottom: 1px solid var(--border); font-size: 12px; font-weight: 700; color: var(--navy); cursor: pointer"
      >
        <input type="checkbox" :checked="isAllSelected" @change="selectAll" />
        <span>Todas las unidades académicas ({{ units.length }})</span>
      </label>
      <label
        v-for="u in units"
        :key="u.id"
        style="display: flex; align-items: center; gap: 8px; padding: 5px 8px; font-size: 11.5px; color: var(--ink); cursor: pointer"
      >
        <input
          type="checkbox"
          :checked="!isAllSelected && selectedUnits.includes(u.name)"
          @change="toggleUnit(u.name)"
        />
        <span>{{ u.name }}</span>
      </label>
    </div>
  </div>
</template>
