<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { AuthUser, PayrollRole } from '@usta/domain';

const props = defineProps<{
  user: AuthUser | null;
  initialCurrentPassword: string;
  isSubmitting: boolean;
}>();

const emit = defineEmits<{
  submitPasswordChange: [payload: { currentPassword: string; newPassword: string }];
  cancel: [];
}>();

const currentPasswordInput = ref(props.initialCurrentPassword || '');
const newPasswordInput = ref('');
const confirmPasswordInput = ref('');
const showNewPassword = ref(false);

watch(
  () => props.initialCurrentPassword,
  (val) => {
    if (val) {
      currentPasswordInput.value = val;
    }
  },
  { immediate: true },
);

const hasMinLength = computed(() => newPasswordInput.value.length >= 8);
const hasLetterAndDigit = computed(
  () => /[a-zA-Z]/.test(newPasswordInput.value) && /\d/.test(newPasswordInput.value),
);
const isDifferentFromTemporary = computed(
  () =>
    newPasswordInput.value.length > 0 &&
    newPasswordInput.value !== currentPasswordInput.value,
);
const passwordsMatch = computed(
  () =>
    newPasswordInput.value.length > 0 &&
    newPasswordInput.value === confirmPasswordInput.value,
);

const canSubmitNewPassword = computed(
  () =>
    currentPasswordInput.value.length > 0 &&
    hasMinLength.value &&
    hasLetterAndDigit.value &&
    isDifferentFromTemporary.value &&
    passwordsMatch.value &&
    !props.isSubmitting,
);

function roleBadgeLabel(role: PayrollRole, unitName?: string | null): string {
  switch (role) {
    case 'director':
      return 'Dirección de Enseñanza y Aprendizaje';
    case 'vice_rector':
      return 'Vicerrectoría Académica';
    case 'research':
      return 'Dirección de Investigación e Innovación';
    case 'dean':
      return unitName ? `Decanatura · ${unitName}` : 'Decanatura';
  }
}

function onFormSubmit(): void {
  if (!canSubmitNewPassword.value) return;
  emit('submitPasswordChange', {
    currentPassword: currentPasswordInput.value,
    newPassword: newPasswordInput.value,
  });
}
</script>

<template>
  <div>
    <div class="user-banner">
      <div class="user-banner__avatar">
        {{ props.user?.fullName.slice(0, 2).toUpperCase() }}
      </div>
      <div>
        <div class="user-banner__name">{{ props.user?.fullName }}</div>
        <div class="user-banner__meta">
          {{ roleBadgeLabel(props.user?.role ?? 'dean', props.user?.unitName) }}
        </div>
      </div>
    </div>

    <h1 class="screen-title" style="margin-top: 6px">
      Definir contraseña personal
    </h1>
    <p class="screen-sub" style="margin-bottom: 14px">
      Reemplace su contraseña temporal para acceder a la plataforma.
    </p>

    <form @submit.prevent="onFormSubmit">
      <div class="field" style="margin-bottom: 12px">
        <label for="current-temp-password">Contraseña temporal</label>
        <input
          id="current-temp-password"
          v-model="currentPasswordInput"
          :type="showNewPassword ? 'text' : 'password'"
          autocomplete="current-password"
          placeholder="Contraseña recibida"
          required
        />
      </div>

      <div class="field" style="margin-bottom: 12px">
        <div class="field__label-row">
          <label for="new-personal-password">Nueva contraseña</label>
          <button
            type="button"
            class="link-btn"
            @click="showNewPassword = !showNewPassword"
          >
            {{ showNewPassword ? 'Ocultar' : 'Mostrar' }}
          </button>
        </div>
        <input
          id="new-personal-password"
          v-model="newPasswordInput"
          :type="showNewPassword ? 'text' : 'password'"
          autocomplete="new-password"
          placeholder="Mínimo 8 caracteres, letras y números"
          required
        />
      </div>

      <div class="field" style="margin-bottom: 12px">
        <label for="confirm-personal-password">Confirmar contraseña</label>
        <input
          id="confirm-personal-password"
          v-model="confirmPasswordInput"
          :type="showNewPassword ? 'text' : 'password'"
          autocomplete="new-password"
          placeholder="Repita la nueva contraseña"
          required
        />
      </div>

      <div class="password-rules">
        <div class="password-rules__item" :class="{ ok: hasMinLength }">
          <span>{{ hasMinLength ? '●' : '○' }}</span>
          Al menos 8 caracteres
        </div>
        <div class="password-rules__item" :class="{ ok: hasLetterAndDigit }">
          <span>{{ hasLetterAndDigit ? '●' : '○' }}</span>
          Al menos una letra y un número
        </div>
        <div class="password-rules__item" :class="{ ok: isDifferentFromTemporary }">
          <span>{{ isDifferentFromTemporary ? '●' : '○' }}</span>
          Distinta de la contraseña temporal
        </div>
        <div class="password-rules__item" :class="{ ok: passwordsMatch }">
          <span>{{ passwordsMatch ? '●' : '○' }}</span>
          Las contraseñas coinciden
        </div>
      </div>

      <div style="display: flex; gap: 8px; margin-top: 16px">
        <button
          type="button"
          class="btn ghost"
          style="flex: 1; justify-content: center"
          @click="emit('cancel')"
        >
          Cerrar sesión
        </button>
        <button
          type="submit"
          class="btn primary"
          style="flex: 2; justify-content: center"
          :disabled="!canSubmitNewPassword"
        >
          {{
            props.isSubmitting
              ? 'Guardando…'
              : 'Guardar y continuar'
          }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped lang="scss">
.link-btn {
  background: none;
  border: none;
  padding: 0;
  font-size: 11px;
  font-weight: 700;
  color: var(--cerulean);
  cursor: pointer;
}

.user-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--surface-soft);
  border: 1px solid var(--border);
  margin-bottom: 10px;
}

.user-banner__avatar {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: var(--navy);
  color: var(--gold);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 13px;
  flex-shrink: 0;
}

.user-banner__name {
  font-weight: 700;
  font-size: 13px;
  color: var(--navy);
}

.user-banner__meta {
  font-size: 11px;
  color: var(--ink-soft);
}

.password-rules {
  background: var(--surface-soft);
  border: 1px solid var(--border);
  border-radius: 9px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.password-rules__item {
  font-size: 11.5px;
  color: var(--ink-soft);
  display: flex;
  align-items: center;
  gap: 7px;

  &.ok {
    color: var(--success);
    font-weight: 700;
  }
}
</style>
