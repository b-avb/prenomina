import type { Pinia } from 'pinia';
import { ACTOR_HEADERS } from '@usta/domain';
import { router } from '@/router';
import { apiClient } from '@/services/api.client';
import { useAuthStore } from '@/stores/auth.store';
import { useOrganizationStore } from '@/stores/organization.store';

/**
 * Registers outbound `Authorization` and URL-encoded `X-USTA-Period` headers on `apiClient`,
 * plus a global `401` interceptor that clears expired credentials and redirects to `/login`.
 */
export function registerActorHeaders(pinia: Pinia): void {
  const authStore = useAuthStore(pinia);
  const orgStore = useOrganizationStore(pinia);

  apiClient.setDefaultHeadersProvider(() => ({
    ...(authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}),
    ...(orgStore.activePeriod
      ? { [ACTOR_HEADERS.period]: encodeURIComponent(orgStore.activePeriod) }
      : {}),
  }));

  apiClient.setUnauthorizedHandler(() => {
    if (authStore.token) {
      authStore.logout();
      if (router.currentRoute.value.path !== '/login') {
        void router.push('/login');
      }
    }
  });
}
