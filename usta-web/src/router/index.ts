import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { detectAppBasePath } from '@/services/api.client';
import { getHomeRouteForRole, useAuthStore } from '@/stores/auth.store';
import type { PayrollRole } from '@usta/domain';

declare module 'vue-router' {
  interface RouteMeta {
    allowedRoles?: PayrollRole[];
    title?: string;
    publicRoute?: boolean;
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: 'Iniciar sesión', publicRoute: true },
  },
  {
    path: '/director/dashboard',
    name: 'executive-dashboard',
    component: () => import('@/views/ExecutiveDashboardView.vue'),
    meta: {
      allowedRoles: ['director', 'vice_rector'],
      title: 'Seguimiento seccional',
    },
  },
  {
    path: '/dean/payroll',
    name: 'faculty-workload',
    component: () => import('@/views/FacultyWorkloadView.vue'),
    meta: {
      allowedRoles: ['director', 'vice_rector', 'dean', 'research'],
      title: 'Prenómina docente',
    },
  },
  {
    path: '/director/organization',
    name: 'organization-management',
    component: () => import('@/views/OrganizationManagementView.vue'),
    meta: {
      allowedRoles: ['director', 'vice_rector'],
      title: 'Unidades y programas',
    },
  },
  {
    path: '/director/catalog',
    name: 'institutional-catalog',
    component: () => import('@/views/InstitutionalCatalogView.vue'),
    meta: {
      allowedRoles: ['director', 'vice_rector'],
      title: 'Catálogo SAC y cupos',
    },
  },
  {
    path: '/vice-rector/approvals',
    name: 'vice-rector-approvals',
    component: () => import('@/views/ViceRectorApprovalsView.vue'),
    meta: {
      allowedRoles: ['director', 'dean', 'vice_rector'],
      title: 'Solicitudes de aval',
    },
  },
  {
    path: '/research/allocations',
    name: 'research-allocations',
    component: () => import('@/views/ResearchAllocationsView.vue'),
    meta: {
      allowedRoles: ['director', 'vice_rector', 'research'],
      title: 'Asignación de investigación',
    },
  },
  // Backward-compatible redirects for Spanish bookmarks
  { path: '/directora/bandeja', redirect: '/director/dashboard' },
  { path: '/decano/prenomina', redirect: '/dean/payroll' },
  { path: '/directora/facultades', redirect: '/director/organization' },
  { path: '/directora/codigos', redirect: '/director/catalog' },
  { path: '/vicerrector/avales', redirect: '/vice-rector/approvals' },
  { path: '/investigacion/asignaciones', redirect: '/research/allocations' },
  // Catch-all fallback
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

export const router = createRouter({
  history: createWebHistory(detectAppBasePath()),
  routes,
});

router.beforeEach((to) => {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated) {
    if (to.path !== '/login') {
      return '/login';
    }
    return true;
  }

  // Mandatory password change on first login with a temporary password
  if (authStore.mustChangePassword) {
    if (to.path !== '/login') {
      return '/login';
    }
    return true;
  }

  // Already authenticated and password is changed: redirect /login to home route
  if (to.path === '/login') {
    return getHomeRouteForRole(authStore.activeRole);
  }

  // Keep Deans scoped to their assigned academic unit(s)
  if (authStore.currentUser?.role === 'dean') {
    const allowed = authStore.managedUnitIds;
    if (allowed.length > 0 && !allowed.includes(authStore.activeUnitId)) {
      authStore.setActiveUnit(allowed[0]!);
    }
  }

  const allowedRoles = to.meta.allowedRoles;
  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(authStore.activeRole)
  ) {
    return getHomeRouteForRole(authStore.activeRole);
  }

  return true;
});
