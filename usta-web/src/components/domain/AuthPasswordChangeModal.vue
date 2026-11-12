<script setup lang="ts">
import { ref } from 'vue';
import UstaModal from '@/components/ui/UstaModal.vue';
import { usePayrollStore } from '@/stores/payroll.store';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const store = usePayrollStore();

const currentPassInput = ref('');
const newPassInput = ref('');
const confirmPassInput = ref('');
const isSaving = ref(false);

async function handleSave(): Promise<void> {
  if (newPassInput.value.length < 8) {
    store.showToast('La nueva contraseña debe tener al menos 8 caracteres', 'error');
    return;
  }
  if (newPassInput.value !== confirmPassInput.value) {
    store.showToast('Las contraseñas no coinciden', 'error');
    return;
  }
  isSaving.value = true;
  try {
    await store.changePassword(currentPassInput.value, newPassInput.value);
    currentPassInput.value = '';
    newPassInput.value = '';
    confirmPassInput.value = '';
    store.showToast('Contraseña actualizada', 'success');
    emit('close');
  } catch (err) {
    store.showToast(
      err instanceof Error ? err.message : 'No se pudo actualizar la contraseña',
      'error',
    );
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <UstaModal
    :open="props.open"
    title="Cambiar contraseña"
    :subtitle="store.currentUserProfile.fullName"
    @close="emit('close')"
  >
    <div class="field" style="margin-bottom: 12px">
      <label>Contraseña actual</label>
      <input
        v-model="currentPassInput"
        type="password"
        placeholder="Contraseña actual"
      />
    </div>
    <div class="field" style="margin-bottom: 12px">
      <label>Nueva contraseña</label>
      <input
        v-model="newPassInput"
        type="password"
        placeholder="Mínimo 8 caracteres, letras y números"
      />
    </div>
    <div class="field" style="margin-bottom: 6px">
      <label>Confirmar contraseña</label>
      <input
        v-model="confirmPassInput"
        type="password"
        placeholder="Repita la nueva contraseña"
        @keyup.enter="handleSave"
      />
    </div>
    <template #footer>
      <button class="btn ghost" @click="emit('close')">
        Cancelar
      </button>
      <button
        class="btn primary"
        :disabled="isSaving"
        @click="handleSave"
      >
        {{ isSaving ? 'Guardando…' : 'Guardar contraseña' }}
      </button>
    </template>
  </UstaModal>
</template>
