<script setup lang="ts">
import { useToast } from '@/composables/useToast';

const { toasts, dismissToast } = useToast();
</script>

<template>
  <div id="toast-container">
    <div
      v-for="t in toasts"
      :key="t.id"
      class="toast"
      :class="t.type === 'success' ? 'success' : t.type === 'error' ? 'error' : ''"
    >
      <div class="toast__mensaje">{{ t.message }}</div>
      <button class="toast__cerrar" type="button" @click="dismissToast(t.id)">×</button>
    </div>
  </div>
</template>
