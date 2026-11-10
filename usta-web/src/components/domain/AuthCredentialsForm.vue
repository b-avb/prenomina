<script setup lang="ts">
import { ref } from 'vue';
import {
  DEFAULT_TEMPORARY_PASSWORD,
  type AuthUser,
  type PayrollRole,
} from '@usta/domain';

const props = defineProps<{
  usersDirectory: AuthUser[];
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
const showQuickDirectory = ref(false);

function roleBadgeLabel(role: PayrollRole, unitName?: string | null): string {
  switch (role) {
    case 'director':
      return 'Dirección de Enseñanza y Aprendizaje';
    case 'vice_rector':
      return 'Vicerrectoría Académica';
    case 'research':
      return 'Dirección de Investigación (SICDDI)';
    case 'dean':
      return unitName ? `Decanatura · ${unitName}` : 'Decanatura / Dirección de Unidad';
  }
}

function selectQuickUser(username: string, mustChange: boolean): void {
  usernameInput.value = username;
  if (mustChange && !passwordInput.value) {
    passwordInput.value = DEFAULT_TEMPORARY_PASSWORD;
  }
}

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
    <h1 class="screen-title">Iniciar sesión institucional</h1>
    <p class="screen-sub">
      <template v-if="props.isMicrosoftEntraEnabled && !props.isLocalLoginAllowed">
        Ingresa con tu cuenta institucional de Microsoft (<code>@{{ props.institutionalDomain }}</code>) para gestionar la prenómina docente seccional.
      </template>
      <template v-else>
        Ingresa con tu <b>nombre de usuario</b> (sin @dominio) y tu contraseña institucional. Si es tu primer ingreso, usa la contraseña temporal asignada.
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
            ? 'Conectando con Microsoft Entra ID…'
            : `Iniciar sesión con Microsoft (@${props.institutionalDomain})`
        }}
      </button>

      <div v-if="props.isLocalLoginAllowed" class="sso-divider">
        <span>o ingresa con usuario y contraseña</span>
      </div>
    </div>

    <form v-if="props.isLocalLoginAllowed" @submit.prevent="onFormSubmit">
      <div class="field" style="margin-bottom: 12px">
        <label for="login-username">Nombre de Usuario (solo usuario)</label>
        <input
          id="login-username"
          v-model="usernameInput"
          type="text"
          autocomplete="username"
          placeholder="Ej: sandra.parra o gloria.grimaldo"
          required
          style="font-family: var(--font-mono); font-weight: 700"
        />
        <span class="field-hint">
          Escribe únicamente el usuario (ej. <code>sandra.parra</code>, <code>wilmar.ruiz</code>, <code>gloria.grimaldo</code>). Compatible con AD <code>@{{ props.institutionalDomain }}</code>.
        </span>
      </div>

      <div class="field" style="margin-bottom: 16px">
        <div style="display: flex; justify-content: space-between; align-items: center">
          <label for="login-password" style="margin-bottom: 0">Contraseña</label>
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
          placeholder="Ingresa tu contraseña temporal o personal"
          required
          style="margin-top: 5px"
        />
      </div>

      <button
        type="submit"
        class="btn primary"
        style="width: 100%; justify-content: center; padding: 10px 16px"
        :disabled="props.isSubmittingLogin || props.isSubmittingMicrosoft"
      >
        {{ props.isSubmittingLogin ? 'Verificando credenciales…' : 'Iniciar Sesión' }}
      </button>
    </form>

    <div
      v-if="props.isLocalLoginAllowed && props.usersDirectory.length > 0"
      class="directory-box"
    >
      <button
        type="button"
        class="directory-box__toggle"
        @click="showQuickDirectory = !showQuickDirectory"
      >
        <span>
          Directorio de usuarios institucionales ({{ props.usersDirectory.length }})
        </span>
        <span>{{ showQuickDirectory ? '▲' : '▼' }}</span>
      </button>

      <div v-if="showQuickDirectory" class="directory-box__body">
        <div class="temp-pass-banner">
          Contraseña temporal inicial por defecto:
          <code>{{ DEFAULT_TEMPORARY_PASSWORD }}</code>
        </div>
        <div class="directory-list">
          <button
            v-for="u in props.usersDirectory"
            :key="u.id"
            type="button"
            class="directory-item"
            @click="selectQuickUser(u.username, u.mustChangePassword)"
          >
            <div>
              <div class="directory-item__user">@{{ u.username }}</div>
              <div class="directory-item__name">
                {{ u.fullName }} · {{ roleBadgeLabel(u.role, u.unitName) }}
              </div>
            </div>
            <span
              class="badge"
              :class="u.mustChangePassword ? 'observado' : 'avalado'"
              style="font-size: 9.5px"
            >
              {{ u.mustChangePassword ? 'Clave Temporal' : 'Clave Personal' }}
            </span>
          </button>
        </div>
      </div>
    </div>
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

.directory-box {
  margin-top: 16px;
  border-top: 1px solid var(--border);
  padding-top: 12px;
}

.directory-box__toggle {
  width: 100%;
  background: var(--surface-soft);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--navy);
  cursor: pointer;
}

.directory-box__body {
  margin-top: 8px;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px;
  background: #fff;
}

.temp-pass-banner {
  font-size: 11.5px;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(244, 180, 0, 0.14);
  color: var(--navy);
  margin-bottom: 8px;
}

.directory-list {
  max-height: 210px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.directory-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  padding: 6px 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface-soft);
  cursor: pointer;
  transition: border-color 0.15s ease;

  &:hover {
    border-color: var(--cerulean);
  }
}

.directory-item__user {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 12px;
  color: var(--navy);
}

.directory-item__name {
  font-size: 10.5px;
  color: var(--ink-soft);
}
</style>
