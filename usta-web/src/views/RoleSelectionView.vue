<script setup lang="ts">
import { useRouter } from 'vue-router';
import { usePayrollStore } from '@/stores/payroll.store';
import { resolvePublicAssetUrl } from '@/services/api.client';
import type { PayrollRole } from '@usta/domain';

const logoUrl = resolvePublicAssetUrl('images/LogoUsta2026.png');

const router = useRouter();
const store = usePayrollStore();

const availableViews: {
  role: PayrollRole;
  title: string;
  subtitle: string;
  route: string;
}[] = [
  {
    role: 'director',
    title: 'Dirección E&A',
    subtitle: 'Bandeja Seccional, Catálogo SAC y Topes',
    route: '/director/dashboard',
  },
  {
    role: 'dean',
    title: 'Decanatura',
    subtitle: 'Prenómina por Docente y Sábana ANEXO 2',
    route: '/dean/payroll',
  },
  {
    role: 'vice_rector',
    title: 'Vicerrectoría',
    subtitle: 'Pre-Aval de Códigos Especiales ANEXO 3',
    route: '/vice-rector/approvals',
  },
  {
    role: 'research',
    title: 'Investigación',
    subtitle: 'Matriz Confidencial por Cédula ANEXO 7',
    route: '/research/allocations',
  },
];

function selectRoleView(item: (typeof availableViews)[number]): void {
  store.selectRole(item.role);
  router.push(item.route);
}
</script>

<template>
  <div class="login-screen">
    <div class="card login-card">
      <div class="login-card__brand">
        <img :src="logoUrl" class="login-card__mark" alt="USTA" />
        <div>
          <b>Gestión Docente · Prenómina</b>
          <span>Santo Tomás · Tunja</span>
        </div>
      </div>

      <h1 class="screen-title">¿Cómo quieres entrar?</h1>
      <p class="screen-sub">
        Tu cuenta institucional tiene más de un perfil asignado en Prenómina. Elige con cuál vista trabajar.
      </p>

      <div class="login-card__roles">
        <button
          v-for="item in availableViews"
          :key="item.role"
          type="button"
          class="rol-card"
          :class="{ active: store.activeRole === item.role }"
          @click="selectRoleView(item)"
        >
          <svg
            class="rol-card__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <template v-if="item.role === 'director'">
              <line x1="5" y1="20" x2="5" y2="11" />
              <line x1="12" y1="20" x2="12" y2="5" />
              <line x1="19" y1="20" x2="19" y2="14" />
            </template>
            <template v-else-if="item.role === 'dean'">
              <path d="M4 5.5C4 4.67 4.67 4 5.5 4H12v16H5.5A1.5 1.5 0 014 18.5v-13z" />
              <path d="M12 4h6.5c.83 0 1.5.67 1.5 1.5v13c0 .83-.67 1.5-1.5 1.5H12" />
            </template>
            <template v-else-if="item.role === 'vice_rector'">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </template>
            <template v-else>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </template>
          </svg>
          <span class="rol-card__label">{{ item.title }}</span>
          <span class="rol-card__sub">{{ item.subtitle }}</span>
        </button>
      </div>
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
  max-width: 520px;
  display: flex;
  flex-direction: column;
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

.login-card__roles {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 6px;
}

.rol-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
  padding: 18px 14px;
  background: #fff;
  border: 1.5px solid var(--border);
  border-radius: var(--r-lg);
  box-shadow: 3px 3px 0 var(--navy);
  font-family: var(--font-body);
  cursor: pointer;
  transition:
    transform 0.1s ease,
    box-shadow 0.1s ease,
    border-color 0.1s ease;

  &:hover,
  &.active {
    border-color: var(--cerulean);
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0 var(--navy);
  }

  &:active {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0 var(--navy);
  }
}

.rol-card__icon {
  width: 28px;
  height: 28px;
  color: var(--blue);
  margin-bottom: 2px;
}

.rol-card__label {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--navy);
}

.rol-card__sub {
  font-size: 11px;
  color: var(--ink-soft);
  line-height: 1.3;
}
</style>
