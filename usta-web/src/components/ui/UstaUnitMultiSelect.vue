<script setup lang="ts">
/**
 * Multi-select dropdown that serializes selected academic unit names into a comma-separated
 * `appliesTo` string and collapses empty or full selections to `'Todas las unidades académicas'`.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import type { AcademicUnitSummary } from '@usta/domain';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    units: AcademicUnitSummary[];
    label?: string;
  }>(),
  {
    label: 'Unidades académicas aplicables',
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const isOpen = ref(false);
const rootRef = ref<HTMLElement | null>(null);

function handleDocumentMouseDown(event: MouseEvent): void {
  if (!isOpen.value || !rootRef.value) return;
  const target = event.target as Node | null;
  if (target && !rootRef.value.contains(target)) {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleDocumentMouseDown);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleDocumentMouseDown);
});

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
  <div ref="rootRef" class="field multi-select">
    <label>{{ label }}</label>
    <button
      type="button"
      class="multi-select__trigger"
      :class="{ 'is-open': isOpen }"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      <span class="multi-select__value">
        {{
          isAllSelected
            ? `Todas las unidades académicas (${units.length})`
            : `${selectedUnits.length} ${selectedUnits.length === 1 ? 'unidad' : 'unidades'}: ${modelValue}`
        }}
      </span>
    </button>

    <div v-if="isOpen" class="multi-select__dropdown">
      <label class="multi-select__option multi-select__option--all">
        <input type="checkbox" :checked="isAllSelected" @change="selectAll" />
        <span>Todas las unidades académicas ({{ units.length }})</span>
      </label>
      <label v-for="u in units" :key="u.id" class="multi-select__option">
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

<style scoped lang="scss">
.multi-select {
  position: relative;
}

.multi-select__trigger {
  width: 100%;
  height: 42px;
  padding: 10px 32px 10px 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--r-sm);
  background-color: #fff;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2300336a' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 11px center;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 400;
  line-height: 1.2;
  color: var(--ink);
  text-align: left;
  display: flex;
  align-items: center;
  cursor: pointer;
  box-sizing: border-box;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &:focus,
  &.is-open {
    outline: none;
    border-color: var(--cerulean);
    box-shadow: 0 0 0 3px rgba(0, 134, 198, 0.12);
  }
}

.multi-select__value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.multi-select__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 40;
  background: #fff;
  border: 1.5px solid var(--cerulean);
  border-radius: var(--r-sm);
  box-shadow: 0 8px 24px rgba(0, 26, 67, 0.16);
  max-height: 220px;
  overflow-y: auto;
  padding: 6px;
  margin-top: 4px;
}

.multi-select__option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 400;
  color: var(--ink);
  cursor: pointer;

  &:hover {
    background: var(--surface-soft);
  }

  &--all {
    border-bottom: 1px solid var(--border);
    border-radius: 6px 6px 0 0;
    margin-bottom: 2px;
    font-weight: 700;
    color: var(--navy);
  }
}
</style>
