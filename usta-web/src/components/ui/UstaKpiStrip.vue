<script setup lang="ts">
export interface KpiCardItem {
  label: string;
  num: string | number;
  suffix?: string;
  meta: string;
  tone?: '' | 'ok' | 'warn' | 'err' | 'accent';
}

withDefaults(
  defineProps<{
    items: KpiCardItem[];
    columns?: number;
  }>(),
  {
    columns: 4,
  },
);
</script>

<template>
  <section
    class="kpi-strip"
    :style="{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }"
  >
    <div
      v-for="(item, idx) in items"
      :key="idx"
      class="kpi"
      :class="item.tone ? `kpi--${item.tone}` : ''"
    >
      <div class="kpi__label">{{ item.label }}</div>
      <div class="kpi__num">
        {{ item.num }}
        <span v-if="item.suffix">{{ item.suffix }}</span>
      </div>
      <div class="kpi__meta">{{ item.meta }}</div>
    </div>
  </section>
</template>
