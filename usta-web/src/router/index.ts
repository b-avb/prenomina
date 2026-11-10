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
    meta: { title: 'Iniciar Sesión', publicRoute: true },
  },
  {
    path: '/role-selection',
    name: 'role-selection',
    component: () => import('@/views/RoleSelectionView.vue'),
    meta: {
      allowedRoles: ['director'],
      title: 'Seleccionar Rol Institucional',
    },
  },
  {
    path: '/director/dashboard',
    name: 'executive-dashboard',
    component: () => import('@/views/ExecutiveDashboardView.vue'),
    meta: {
      allowedRoles: ['director', 'vice_rector'],
      title: 'Bandeja Seccional y Analítica',
    },
  },
  {
    path: '/dean/payroll',
    name: 'faculty-workload',
    component: () => import('@/views/FacultyWorkloadView.vue'),
    meta: {
      allowedRoles: ['director', 'dean', 'research'],
      title: 'Prenómina por Facultad (ANEXO 2)',
    },
  },
  {
    path: '/director/organization',
    name: 'organization-management',
    component: () => import('@/views/OrganizationManagementView.vue'),
    meta: {
      allowedRoles: ['director'],
      title: 'Decanos y Programas Académicos',
    },
  },
  {
    path: '/director/catalog',
    name: 'institutional-catalog',
    component: () => import('@/views/InstitutionalCatalogView.vue'),
    meta: {
      allowedRoles: ['director'],
      title: 'Catálogo SAC y Reglas (ANEXOS 4, 5 y 6)',
    },
  },
  {
    path: '/vice-rector/approvals',
    name: 'vice-rector-approvals',
    component: () => import('@/views/ViceRectorApprovalsView.vue'),
    meta: {
      allowedRoles: ['director', 'dean', 'vice_rector'],
      title: 'Pre-Avales V.A. (ANEXO 3)',
    },
  },
  {
    path: '/research/allocations',
    name: 'research-allocations',
    component: () => import('@/views/ResearchAllocationsView.vue'),
    meta: {
      allowedRoles: ['director', 'research'],
      title: 'Investigación SICDDI (ANEXO 7)',
    },
  },
  // Backward-compatible redirects for legacy Spanish bookmarks
  { path: '/seleccionar-vista', redirect: '/role-selection' },
  { path: '/directora/bandeja', redirect: '/director/dashboard' },
  { path: '/decano/prenomina', redirect: '/dean/payroll' },
  { path: '/directora/facultades', redirect: '/director/organization' },
  { path: '/directora/codigos', redirect: '/director/catalog' },
  { path: '/vicerrector/avales', redirect: '/vice-rector/approvals' },
  { path: '/investigacion/asignaciones', redirect: '/research/allocations' },
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

  // Keep deans locked to their assigned unit
  if (authStore.currentUser?.role === 'dean' && authStore.currentUser.unitId) {
    authStore.setActiveUnit(authStore.currentUser.unitId);
  }

  const allowedRoles = to.meta.allowedRoles;
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(authStore.activeRole)) {
    return getHomeRouteForRole(authStore.activeRole);
  }

  return true;
});
