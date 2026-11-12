import { computed, type Ref } from 'vue';
import {
  INSTITUTIONAL_EMAIL_DOMAIN,
  type AcademicUnitSummary,
  type AuthUser,
  type PayrollRole,
} from '@usta/domain';

export interface InstitutionalUserProfile {
  fullName: string;
  username: string;
  jobTitle: string;
  email: string;
  initials: string;
}

/** Strips ecclesiastical and academic honorifics before extracting two-letter avatar initials. */
function computeInitials(name: string): string {
  const cleaned = name
    .replace(/\b(Fr\.|O\.P\.|Ing\.|Dr\.|Dra\.|Mg\.)/gi, '')
    .trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  }
  return cleaned.slice(0, 2).toUpperCase() || 'US';
}

/** Derives the header user profile chip and role boolean flags from active auth and unit state. */
export function useAuthRole(
  activeRole: Ref<PayrollRole>,
  units: Ref<AcademicUnitSummary[]>,
  activeUnitId: Ref<string>,
  currentUser?: Ref<AuthUser | null>,
) {
  const currentUserProfile = computed<InstitutionalUserProfile>(() => {
    const authUser = currentUser?.value ?? null;
    const unit = units.value.find(
      (u) => u.id === (activeUnitId.value || authUser?.unitId),
    );
    const viewRoleLabel =
      activeRole.value === 'director'
        ? 'Dirección de Enseñanza y Aprendizaje'
        : activeRole.value === 'vice_rector'
          ? 'Vicerrectoría Académica'
          : activeRole.value === 'research'
            ? 'Dirección de Investigación e Innovación'
            : `Decanatura · ${unit?.name ?? authUser?.unitName ?? 'Unidad académica'}`;

    if (authUser) {
      return {
        fullName: authUser.fullName,
        username: authUser.username,
        jobTitle: viewRoleLabel,
        email: authUser.email || `${authUser.username}@${INSTITUTIONAL_EMAIL_DOMAIN}`,
        initials: computeInitials(authUser.fullName),
      };
    }

    return {
      fullName: 'Sesión institucional',
      username: 'usuario',
      jobTitle: viewRoleLabel,
      email: `prenomina@${INSTITUTIONAL_EMAIL_DOMAIN}`,
      initials: 'US',
    };
  });

  const isDirector = computed(() => activeRole.value === 'director');
  const isDean = computed(() => activeRole.value === 'dean');
  const isViceRector = computed(() => activeRole.value === 'vice_rector');
  const isResearch = computed(() => activeRole.value === 'research');

  return {
    currentUserProfile,
    isDirector,
    isDean,
    isViceRector,
    isResearch,
  };
}
