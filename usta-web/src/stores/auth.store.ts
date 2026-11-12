import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type {
  AuthConfigResponse,
  AuthSessionResponse,
  AuthUser,
  CreateUserAccountDto,
  PayrollRole,
  ResetUserPasswordResponse,
} from '@usta/domain';
import {
  consumeMicrosoftRedirectResult,
  resolveMsalRuntimeConfig,
  signInWithMicrosoftPopup,
  signInWithMicrosoftRedirect,
} from '@/auth/msal';
import { authApi } from '@/services/api';
import { useStateSyncStore } from './state-sync.store';
import { upsertById } from './utils/collection.utils';

const AUTH_TOKEN_KEY = 'usta_auth_token_v1';
const AUTH_USER_KEY = 'usta_auth_user_v1';

function readStoredToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

/** Maps each institutional role to its default landing route after authentication. */
export function getHomeRouteForRole(role: PayrollRole): string {
  switch (role) {
    case 'director':
      return '/director/dashboard';
    case 'dean':
      return '/dean/payroll';
    case 'vice_rector':
      return '/vice-rector/approvals';
    case 'research':
      return '/research/allocations';
  }
}

/**
 * Manages authenticated user session persistence, local and Microsoft Entra ID login flows,
 * mandatory temporary-password rotation gating, user provisioning, and Dean unit scoping.
 */
export const useAuthStore = defineStore('auth', () => {
  const initialToken = readStoredToken();
  const initialUser = readStoredUser();

  const token = ref<string | null>(initialToken);
  const currentUser = ref<AuthUser | null>(initialUser);
  const usersDirectory = ref<AuthUser[]>([]);
  const pendingTemporaryPassword = ref<string>('');
  const authConfig = ref<AuthConfigResponse | null>(null);

  const activeRole = computed<PayrollRole>(() => currentUser.value?.role ?? 'dean');
  const managedUnitIds = computed<string[]>(() => {
    const u = currentUser.value;
    if (!u) return [];
    if (u.managedUnitIds && u.managedUnitIds.length > 0) {
      return [...u.managedUnitIds];
    }
    return u.unitId ? [u.unitId] : [];
  });

  const activeUnitId = ref<string>(
    initialUser?.managedUnitIds?.[0] || initialUser?.unitId || '',
  );
  const versionComparisonMode = ref(false);

  const isAuthenticated = computed(() => Boolean(token.value && currentUser.value));
  const mustChangePassword = computed(() =>
    Boolean(currentUser.value?.mustChangePassword),
  );
  const msalRuntimeConfig = computed(() =>
    resolveMsalRuntimeConfig(authConfig.value),
  );
  const isMicrosoftEntraEnabled = computed(() => msalRuntimeConfig.value.enabled);
  const isLocalLoginAllowed = computed(
    () =>
      msalRuntimeConfig.value.authMode !== 'microsoft' ||
      !msalRuntimeConfig.value.enabled,
  );

  function persistSession(nextToken: string | null, nextUser: AuthUser | null): void {
    token.value = nextToken;
    currentUser.value = nextUser;
    try {
      if (nextToken && nextUser) {
        localStorage.setItem(AUTH_TOKEN_KEY, nextToken);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
      } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
      }
    } catch {
      // Storage unavailable
    }
  }

  function syncActiveUnitForUser(user: AuthUser): void {
    if (user.role === 'dean') {
      const allowed =
        user.managedUnitIds && user.managedUnitIds.length > 0
          ? user.managedUnitIds
          : user.unitId
            ? [user.unitId]
            : [];
      if (!allowed.includes(activeUnitId.value)) {
        activeUnitId.value = allowed[0] || '';
      }
    } else if (user.unitId && !activeUnitId.value) {
      activeUnitId.value = user.unitId;
    }
  }

  function applyAuthenticatedUser(session: AuthSessionResponse): void {
    const previousUserId = currentUser.value?.id;
    if (previousUserId && previousUserId !== session.user.id) {
      useStateSyncStore().reset();
    }
    persistSession(session.token, session.user);
    syncActiveUnitForUser(session.user);
    upsertUserInDirectory(session.user);
    if (!session.user.mustChangePassword) {
      void useStateSyncStore().initialize();
      if (session.user.role === 'director' || session.user.role === 'vice_rector') {
        void fetchUsersDirectory();
      }
    }
  }

  async function fetchAuthConfig(): Promise<AuthConfigResponse | null> {
    try {
      const cfg = await authApi.config();
      authConfig.value = cfg;
      return cfg;
    } catch {
      return authConfig.value;
    }
  }

  async function login(
    username: string,
    password: string,
  ): Promise<AuthSessionResponse> {
    const session = await authApi.login({ username, password });
    pendingTemporaryPassword.value = session.user.mustChangePassword ? password : '';
    applyAuthenticatedUser(session);
    return session;
  }

  async function loginWithMicrosoftPopup(): Promise<AuthSessionResponse> {
    if (!authConfig.value) {
      await fetchAuthConfig();
    }
    const tokens = await signInWithMicrosoftPopup(authConfig.value);
    const session = await authApi.loginWithMicrosoft(tokens);
    pendingTemporaryPassword.value = '';
    applyAuthenticatedUser(session);
    return session;
  }

  async function startMicrosoftRedirect(): Promise<void> {
    if (!authConfig.value) {
      await fetchAuthConfig();
    }
    await signInWithMicrosoftRedirect(authConfig.value);
  }

  async function completeMicrosoftRedirectIfPresent(): Promise<AuthSessionResponse | null> {
    if (!authConfig.value) {
      await fetchAuthConfig();
    }
    const redirectTokens = await consumeMicrosoftRedirectResult(authConfig.value);
    if (!redirectTokens) return null;
    const session = await authApi.loginWithMicrosoft(redirectTokens);
    pendingTemporaryPassword.value = '';
    applyAuthenticatedUser(session);
    return session;
  }

  async function changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<AuthSessionResponse> {
    const session = await authApi.changePassword({
      currentPassword,
      newPassword,
    });
    pendingTemporaryPassword.value = '';
    applyAuthenticatedUser(session);
    return session;
  }

  async function fetchUsersDirectory(): Promise<AuthUser[]> {
    try {
      const list = await authApi.listUsers();
      usersDirectory.value = list;
      return list;
    } catch {
      return usersDirectory.value;
    }
  }

  function upsertUserInDirectory(user: AuthUser): void {
    upsertById(usersDirectory.value, user);
  }

  async function createUserAccount(
    dto: CreateUserAccountDto,
  ): Promise<ResetUserPasswordResponse> {
    const created = await authApi.createUser(dto);
    upsertUserInDirectory(created.user);
    return created;
  }

  async function resetUserPassword(
    userId: string,
    temporaryPassword?: string,
  ): Promise<ResetUserPasswordResponse> {
    const reset = await authApi.resetUserPassword(userId, temporaryPassword);
    upsertUserInDirectory(reset.user);
    if (currentUser.value?.id === reset.user.id) {
      persistSession(token.value, reset.user);
    }
    return reset;
  }

  async function refreshSession(): Promise<void> {
    void fetchAuthConfig();
    if (!token.value) return;
    try {
      const freshUser = await authApi.me();
      persistSession(token.value, freshUser);
      syncActiveUnitForUser(freshUser);
      if (!freshUser.mustChangePassword) {
        await useStateSyncStore().initialize();
        if (freshUser.role === 'director' || freshUser.role === 'vice_rector') {
          void fetchUsersDirectory();
        }
      }
    } catch {
      logout();
    }
  }

  function logout(): void {
    pendingTemporaryPassword.value = '';
    usersDirectory.value = [];
    activeUnitId.value = '';
    versionComparisonMode.value = false;
    useStateSyncStore().reset();
    persistSession(null, null);
  }

  function setActiveUnit(unitId: string): void {
    if (currentUser.value?.role === 'dean') {
      const allowed = managedUnitIds.value;
      if (allowed.length > 0 && !allowed.includes(unitId)) {
        activeUnitId.value = allowed[0]!;
        return;
      }
    }
    activeUnitId.value = unitId;
  }

  function setVersionComparisonMode(enabled: boolean): void {
    versionComparisonMode.value = enabled;
  }

  return {
    token,
    currentUser,
    usersDirectory,
    pendingTemporaryPassword,
    authConfig,
    msalRuntimeConfig,
    isMicrosoftEntraEnabled,
    isLocalLoginAllowed,
    isAuthenticated,
    mustChangePassword,
    activeRole,
    managedUnitIds,
    activeUnitId,
    versionComparisonMode,
    fetchAuthConfig,
    login,
    loginWithMicrosoftPopup,
    startMicrosoftRedirect,
    completeMicrosoftRedirectIfPresent,
    changePassword,
    fetchUsersDirectory,
    upsertUserInDirectory,
    createUserAccount,
    resetUserPassword,
    refreshSession,
    logout,
    setActiveUnit,
    setVersionComparisonMode,
  };
});
