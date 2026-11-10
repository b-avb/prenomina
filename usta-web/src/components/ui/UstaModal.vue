<script setup lang="ts">
withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    subtitle?: string;
    maxWidth?: string;
    wide?: boolean;
  }>(),
  {
    subtitle: '',
    maxWidth: '580px',
    wide: false,
  },
);

const emit = defineEmits<{
  (e: 'close'): void;
}>();
</script>

<template>
  <div v-if="open" class="modal-backdrop" @click.self="emit('close')">
    <div class="modal-shell" :style="{ maxWidth: wide ? '780px' : maxWidth }">
      <button class="modal-cerrar" type="button" aria-label="Cerrar modal" @click="emit('close')">
        ×
      </button>
      <div class="modal">
        <h2>{{ title }}</h2>
        <p v-if="subtitle" class="sub" v-html="subtitle"></p>
        <slot />
        <div v-if="$slots.footer || $slots.actions" class="modal-actions">
          <slot name="footer" />
          <slot name="actions" />
        </div>
      </div>
    </div>
  </div>
</template>
