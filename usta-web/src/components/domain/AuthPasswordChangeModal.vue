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
    store.showToast('La nueva contraseña debe tener mínimo 8 caracteres', 'error');
    return;
  }
  if (newPassInput.value !== confirmPassInput.value) {
    store.showToast('La confirmación de la nueva contraseña no coincide', 'error');
    return;
  }
  isSaving.value = true;
  try {
    await store.changePassword(currentPassInput.value, newPassInput.value);
    currentPassInput.value = '';
    newPassInput.value = '';
    confirmPassInput.value = '';
    store.showToast('Tu contraseña personal ha sido actualizada', 'success');
    emit('close');
  } catch (err) {
    store.showToast(
      err instanceof Error ? err.message : 'No fue posible actualizar la contraseña',
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
    title="Actualizar Contraseña Institucional"
    :subtitle="`Usuario activo: <b>@${store.currentUser?.username ?? store.currentUserProfile.username}</b> (${store.currentUserProfile.fullName})`"
    @close="emit('close')"
  >
    <div class="field" style="margin-bottom: 12px">
      <label>Contraseña Actual</label>
      <input
        v-model="currentPassInput"
        type="password"
        placeholder="Ingresa tu contraseña actual"
      />
    </div>
    <div class="field" style="margin-bottom: 12px">
      <label>Nueva Contraseña Personal (mín. 8 caracteres, letras y números)</label>
      <input
        v-model="newPassInput"
        type="password"
        placeholder="Nueva contraseña"
      />
    </div>
    <div class="field" style="margin-bottom: 6px">
      <label>Confirmar Nueva Contraseña</label>
      <input
        v-model="confirmPassInput"
        type="password"
        placeholder="Repite la nueva contraseña"
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
        {{ isSaving ? 'Guardando…' : 'Guardar Nueva Contraseña' }}
      </button>
    </template>
  </UstaModal>
</template>
