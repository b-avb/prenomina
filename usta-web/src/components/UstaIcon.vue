<script lang="ts">
export type UstaIconName =
  | 'dashboard'
  | 'prenomina'
  | 'codigos'
  | 'avales'
  | 'investigacion'
  | 'facultades'
  | 'usuarios';
</script>

<script setup lang="ts">
defineProps<{
  name: UstaIconName;
}>();
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <template v-if="name === 'dashboard'">
      <line x1="5" y1="20" x2="5" y2="11" />
      <line x1="12" y1="20" x2="12" y2="5" />
      <line x1="19" y1="20" x2="19" y2="14" />
    </template>
    <template v-else-if="name === 'prenomina'">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18M9 10v10" />
    </template>
    <template v-else-if="name === 'codigos'">
      <path d="M4 5.5C4 4.67 4.67 4 5.5 4H12v16H5.5A1.5 1.5 0 014 18.5v-13z" />
      <path d="M12 4h6.5c.83 0 1.5.67 1.5 1.5v13c0 .83-.67 1.5-1.5 1.5H12" />
    </template>
    <template v-else-if="name === 'avales'">
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </template>
    <template v-else-if="name === 'investigacion'">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
      <path d="M11 8v6M8 11h6" />
    </template>
    <template v-else-if="name === 'facultades'">
      <path d="M3 10L12 4l9 6" />
      <path d="M4 10v9M9 10v9M15 10v9M20 10v9" />
      <path d="M3 19h18" />
      <path d="M2 21.5h20" />
    </template>
    <template v-else-if="name === 'usuarios'">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5" />
      <circle cx="17" cy="8.5" r="2.4" />
      <path d="M15 13.7c2.2.3 3.8 2.1 3.8 4.3" />
    </template>
    <template v-else>
      <circle cx="12" cy="12" r="9" />
    </template>
  </svg>
</template>
