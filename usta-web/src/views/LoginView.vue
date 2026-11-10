<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { INSTITUTIONAL_EMAIL_DOMAIN } from '@usta/domain';
import AuthCredentialsForm from '@/components/domain/AuthCredentialsForm.vue';
import AuthPasswordChangeForm from '@/components/domain/AuthPasswordChangeForm.vue';
import { toApiError } from '@/composables/useMutation';
import { getHomeRouteForRole, useAuthStore } from '@/stores/auth.store';
import { usePayrollStore } from '@/stores/payroll.store';
import { resolvePublicAssetUrl } from '@/services/api.client';

const logoUrl = resolvePublicAssetUrl('images/LogoUsta2026.png');

const router = useRouter();
const authStore = useAuthStore();
const payrollStore = usePayrollStore();

const isSubmittingLogin = ref(false);
const isSubmittingMicrosoft = ref(false);
const isSubmittingPasswordChange = ref(false);
const errorMessage = ref<string | null>(null);

const isPasswordChangeStep = computed(
  () => authStore.isAuthenticated && authStore.mustChangePassword,
);

const institutionalDomain = computed(
  () => authStore.msalRuntimeConfig.institutionalDomain || INSTITUTIONAL_EMAIL_DOMAIN,
);

onMounted(async () => {
  await authStore.fetchAuthConfig();
  if (authStore.isMicrosoftEntraEnabled) {
    try {
      isSubmittingMicrosoft.value = true;
      const redirectSession = await authStore.completeMicrosoftRedirectIfPresent();
      if (redirectSession) {
        payrollStore.showToast(
          `Sesión institucional Microsoft iniciada como ${redirectSession.user.fullName} (${redirectSession.user.email ?? `@${redirectSession.user.username}`})`,
          'success',
        );
        await router.push(getHomeRouteForRole(redirectSession.user.role));
      }
    } catch (error) {
      errorMessage.value = toApiError(error).message;
    } finally {
      isSubmittingMicrosoft.value = false;
    }
  }
});

async function handleMicrosoftLogin(): Promise<void> {
  isSubmittingMicrosoft.value = true;
  errorMessage.value = null;
  try {
    const session = await authStore.loginWithMicrosoftPopup();
    payrollStore.showToast(
      `Sesión institucional Microsoft iniciada como ${session.user.fullName}`,
      'success',
    );
    await router.push(getHomeRouteForRole(session.user.role));
  } catch (popupError) {
    const msg = popupError instanceof Error ? popupError.message : '';
    if (msg.includes('popup_window_error') || msg.includes('BrowserAuthError')) {
      try {
        await authStore.startMicrosoftRedirect();
        return;
      } catch (redirectError) {
        errorMessage.value = toApiError(redirectError).message;
      }
    } else if (!msg.includes('user_cancelled')) {
      errorMessage.value = toApiError(popupError).message;
    }
  } finally {
    isSubmittingMicrosoft.value = false;
  }
}

async function handleLoginSubmit(payload: {
  username: string;
  password: string;
}): Promise<void> {
  if (!payload.username || !payload.password) {
    errorMessage.value = 'Debes ingresar tu nombre de usuario y tu contraseña.';
    return;
  }

  isSubmittingLogin.value = true;
  errorMessage.value = null;

  try {
    const session = await authStore.login(payload.username, payload.password);
    if (session.user.mustChangePassword) {
      payrollStore.showToast(
        `Bienvenido(a) ${session.user.fullName}. Por seguridad debes cambiar tu contraseña temporal antes de continuar.`,
        'info',
      );
      return;
    }

    payrollStore.showToast(
      `Sesión iniciada como ${session.user.fullName} (@${session.user.username})`,
      'success',
    );
    await router.push(getHomeRouteForRole(session.user.role));
  } catch (error) {
    errorMessage.value = toApiError(error).message;
  } finally {
    isSubmittingLogin.value = false;
  }
}

async function handleChangePasswordSubmit(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  isSubmittingPasswordChange.value = true;
  errorMessage.value = null;

  try {
    const session = await authStore.changePassword(
      payload.currentPassword,
      payload.newPassword,
    );
    payrollStore.showToast(
      'Contraseña actualizada exitosamente. Bienvenido(a) a la plataforma de prenómina.',
      'success',
    );
    await router.push(getHomeRouteForRole(session.user.role));
  } catch (error) {
    errorMessage.value = toApiError(error).message;
  } finally {
    isSubmittingPasswordChange.value = false;
  }
}

function handleCancelPasswordChange(): void {
  authStore.logout();
  errorMessage.value = null;
}
</script>

<template>
  <div class="login-screen">
    <div class="card login-card" :class="{ 'login-card--wide': isPasswordChangeStep }">
      <div class="login-card__brand">
        <img :src="logoUrl" class="login-card__mark" alt="USTA" />
        <div>
          <b>Gestión Docente · Prenómina</b>
          <span>Santo Tomás · Seccional Tunja</span>
        </div>
      </div>

      <div v-if="errorMessage" class="alert-row" style="margin-bottom: 14px">
        <span>⚠</span>
        <span><b>{{ errorMessage }}</b></span>
      </div>

      <AuthCredentialsForm
        v-if="!isPasswordChangeStep"
        :users-directory="authStore.usersDirectory"
        :is-microsoft-entra-enabled="authStore.isMicrosoftEntraEnabled"
        :is-local-login-allowed="authStore.isLocalLoginAllowed"
        :institutional-domain="institutionalDomain"
        :is-submitting-login="isSubmittingLogin"
        :is-submitting-microsoft="isSubmittingMicrosoft"
        @submit-local="handleLoginSubmit"
        @submit-microsoft="handleMicrosoftLogin"
      />

      <AuthPasswordChangeForm
        v-else
        :user="authStore.currentUser"
        :initial-current-password="authStore.pendingTemporaryPassword"
        :is-submitting="isSubmittingPasswordChange"
        @submit-password-change="handleChangePasswordSubmit"
        @cancel="handleCancelPasswordChange"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--bg);
}

.login-card {
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
}

.login-card--wide {
  max-width: 480px;
}

.login-card__brand {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 18px;

  b {
    display: block;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 15px;
    color: var(--navy);
    line-height: 1.2;
  }

  span {
    font-size: 10.5px;
    color: var(--ink-faint);
    text-transform: uppercase;
    letter-spacing: 1px;
  }
}

.login-card__mark {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  flex-shrink: 0;
}
</style>
