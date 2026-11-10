import { toRef } from 'vue';
import type { Pinia } from 'pinia';
import { ACTOR_HEADERS } from '@usta/domain';
import { useAuthRole } from '@/composables/useAuthRole';
import { router } from '@/router';
import { apiClient } from '@/services/api.client';
import { useAuthStore } from '@/stores/auth.store';
import { useOrganizationStore } from '@/stores/organization.store';

/**
 * Wires the authenticated session Bearer token and acting user headers into every API request.
 */
export function registerActorHeaders(pinia: Pinia): void {
  const authStore = useAuthStore(pinia);
  const orgStore = useOrganizationStore(pinia);
  const { currentUserProfile } = useAuthRole(
    toRef(authStore, 'activeRole'),
    toRef(orgStore, 'units'),
    toRef(authStore, 'activeUnitId'),
    toRef(authStore, 'currentUser'),
  );

  apiClient.setDefaultHeadersProvider(() => ({
    ...(authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}),
    [ACTOR_HEADERS.name]: encodeURIComponent(currentUserProfile.value.fullName),
    [ACTOR_HEADERS.role]: encodeURIComponent(authStore.activeRole),
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
