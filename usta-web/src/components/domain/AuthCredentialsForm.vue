<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  isMicrosoftEntraEnabled: boolean;
  isLocalLoginAllowed: boolean;
  institutionalDomain: string;
  isSubmittingLogin: boolean;
  isSubmittingMicrosoft: boolean;
}>();

const emit = defineEmits<{
  submitLocal: [payload: { username: string; password: string }];
  submitMicrosoft: [];
}>();

const usernameInput = ref('');
const passwordInput = ref('');
const showLoginPassword = ref(false);

function onFormSubmit(): void {
  const cleanUser = usernameInput.value.trim().toLowerCase().split('@')[0] ?? '';
  emit('submitLocal', {
    username: cleanUser,
    password: passwordInput.value,
  });
}
</script>

<template>
  <div>
    <h1 class="screen-title">Iniciar sesión</h1>
    <p class="screen-sub">
      <template v-if="props.isMicrosoftEntraEnabled && !props.isLocalLoginAllowed">
        Acceda con su cuenta institucional (<code>@{{ props.institutionalDomain }}</code>).
      </template>
      <template v-else>
        Acceda con su correo o usuario institucional. En el primer ingreso deberá definir una contraseña personal.
      </template>
    </p>

    <div v-if="props.isMicrosoftEntraEnabled" style="margin-bottom: 14px">
      <button
        type="button"
        class="btn primary"
        style="width: 100%; justify-content: center; padding: 10px 16px"
        :disabled="props.isSubmittingMicrosoft || props.isSubmittingLogin"
        @click="emit('submitMicrosoft')"
      >
        <svg
          style="vertical-align: middle; margin-right: 8px; flex-shrink: 0"
          viewBox="0 0 21 21"
          width="16"
          height="16"
          aria-hidden="true"
        >
          <rect x="1" y="1" width="9" height="9" fill="#f25022" />
          <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
          <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
          <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
        </svg>
        {{
          props.isSubmittingMicrosoft
            ? 'Conectando con Microsoft…'
            : `Continuar con Microsoft (@${props.institutionalDomain})`
        }}
      </button>

      <div v-if="props.isLocalLoginAllowed" class="sso-divider">
        <span>o con usuario y contraseña</span>
      </div>
    </div>

    <form v-if="props.isLocalLoginAllowed" @submit.prevent="onFormSubmit">
      <div class="field" style="margin-bottom: 12px">
        <label for="login-username">Usuario o correo institucional</label>
        <input
          id="login-username"
          v-model="usernameInput"
          type="text"
          autocomplete="username"
          :placeholder="`usuario@${props.institutionalDomain}`"
          required
        />
      </div>

      <div class="field" style="margin-bottom: 16px">
        <div class="field__label-row">
          <label for="login-password">Contraseña</label>
          <button
            type="button"
            class="link-btn"
            @click="showLoginPassword = !showLoginPassword"
          >
            {{ showLoginPassword ? 'Ocultar' : 'Mostrar' }}
          </button>
        </div>
        <input
          id="login-password"
          v-model="passwordInput"
          :type="showLoginPassword ? 'text' : 'password'"
          autocomplete="current-password"
          placeholder="Contraseña"
          required
        />
      </div>

      <button
        type="submit"
        class="btn primary"
        style="width: 100%; justify-content: center; padding: 10px 16px"
        :disabled="props.isSubmittingLogin || props.isSubmittingMicrosoft"
      >
        {{ props.isSubmittingLogin ? 'Verificando…' : 'Iniciar sesión' }}
      </button>
    </form>
  </div>
</template>

<style scoped lang="scss">
.field-hint {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: var(--ink-soft);
}

.link-btn {
  background: none;
  border: none;
  padding: 0;
  font-size: 11px;
  font-weight: 700;
  color: var(--cerulean);
  cursor: pointer;
}

.sso-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  font-size: 11px;
  color: var(--ink-faint);
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }
}
</style>
