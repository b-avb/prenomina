<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { usePayrollStore } from '@/stores/payroll.store';
import UstaModal from '@/components/ui/UstaModal.vue';
import OrganizationDeansTab from '@/components/domain/OrganizationDeansTab.vue';
import OrganizationProgramsTab from '@/components/domain/OrganizationProgramsTab.vue';
import AcademicUnitFormModal from '@/components/domain/AcademicUnitFormModal.vue';
import DeanAssignmentModal from '@/components/domain/DeanAssignmentModal.vue';
import AcademicProgramFormModal from '@/components/domain/AcademicProgramFormModal.vue';
import type { AcademicUnitSummary, ProgramQuotaAnnex5 } from '@usta/domain';

export interface IssuedCredentialsPayload {
  title: string;
  fullName: string;
  unitName: string;
  username: string;
  temporaryPassword: string;
}

const store = usePayrollStore();
const router = useRouter();

const activeTab = ref<'deans' | 'programs'>('deans');
const isNewUnitModalOpen = ref(false);
const isEditDeanModalOpen = ref(false);
const selectedUnitForDean = ref<AcademicUnitSummary | null>(null);
const isNewProgramModalOpen = ref(false);
const defaultUnitForProgram = ref<string>('');
const editingProgramModel = ref<ProgramQuotaAnnex5 | null>(null);
const programsFilterUnitId = ref<string>('TODAS');
const issuedCredentials = ref<IssuedCredentialsPayload | null>(null);

const headerGovernanceLabel = computed(() =>
  store.activeRole === 'vice_rector'
    ? 'VICERRECTORÍA ACADÉMICA'
    : 'DIRECCIÓN DE ENSEÑANZA Y APRENDIZAJE',
);

function openEditDeanModal(unit?: AcademicUnitSummary) {
  selectedUnitForDean.value = unit ?? store.units[0] ?? null;
  isEditDeanModalOpen.value = true;
}

function openNewProgramModal(unitId?: string) {
  editingProgramModel.value = null;
  defaultUnitForProgram.value = unitId ?? store.units[0]?.id ?? '';
  isNewProgramModalOpen.value = true;
}

function openEditProgramModal(program: ProgramQuotaAnnex5) {
  editingProgramModel.value = program;
  defaultUnitForProgram.value = program.unitId;
  isNewProgramModalOpen.value = true;
}

function closeProgramModal() {
  isNewProgramModalOpen.value = false;
  editingProgramModel.value = null;
}

function viewUnitPrograms(unitId: string) {
  programsFilterUnitId.value = unitId;
  activeTab.value = 'programs';
}

function navigateToFacultyPayroll(unitId: string) {
  store.selectUnit(unitId);
  router.push('/dean/payroll');
}

function handleIssuedCredentials(payload: IssuedCredentialsPayload) {
  issuedCredentials.value = payload;
}

async function copyIssuedCredentials() {
  if (!issuedCredentials.value) return;
  const text = `Unidad: ${issuedCredentials.value.unitName}\nResponsable: ${issuedCredentials.value.fullName}\nUsuario: ${issuedCredentials.value.username}\nContraseña temporal: ${issuedCredentials.value.temporaryPassword}`;
  try {
    await navigator.clipboard.writeText(text);
    store.showToast('Credenciales copiadas al portapapeles');
  } catch {
    store.showToast('Copie manualmente la contraseña temporal mostrada', 'info');
  }
}
</script>

<template>
  <div>
    <!-- MODULE HEADER -->
    <div class="page-top">
      <div>
        <div class="eyebrow-tag" style="margin-bottom: 3px">
          {{ headerGovernanceLabel }} · ORGANIZACIÓN ACADÉMICA · {{ store.activePeriod }}
        </div>
        <h1 class="screen-title" style="margin: 0; font-size: 22px">
          Unidades académicas, decanaturas y programas
        </h1>
      </div>

      <div class="page-actions">
        <button type="button" class="btn accent small" @click="openNewProgramModal()">
          Nuevo programa
        </button>
        <button type="button" class="btn ghost small" @click="openEditDeanModal()">
          Cambiar responsable
        </button>
        <button type="button" class="btn primary small" @click="isNewUnitModalOpen = true">
          Nueva unidad
        </button>
      </div>
    </div>

    <!-- KPI STRIP -->
    <div class="grid cols-4" style="margin-bottom: 16px; gap: 12px">
      <div class="card stat" style="padding: 14px 18px">
        <div class="num" style="font-size: 24px">{{ store.units.length }}</div>
        <div class="lbl">Unidades académicas</div>
      </div>
      <div class="card stat" style="padding: 14px 18px">
        <div class="num" style="font-size: 24px; color: var(--cerulean)">
          {{ store.units.filter((u) => u.hasPostgraduates).length }}
        </div>
        <div class="lbl">Unidades con posgrado</div>
      </div>
      <div class="card stat" style="padding: 14px 18px">
        <div class="num" style="font-size: 24px; color: var(--success)">
          {{ store.programQuotas.length }}
        </div>
        <div class="lbl">Programas registrados</div>
      </div>
      <div class="card stat" style="padding: 14px 18px">
        <div class="num" style="font-size: 24px; color: var(--navy)">
          {{ store.programQuotas.filter((p) => p.isActive).length }}
        </div>
        <div class="lbl">Programas con cohorte activa</div>
      </div>
    </div>

    <!-- TABS -->
    <div class="tabs" style="margin-bottom: 14px">
      <button
        type="button"
        class="tab"
        :class="{ active: activeTab === 'deans' }"
        @click="activeTab = 'deans'"
      >
        Unidades y responsables ({{ store.units.length }})
      </button>
      <button
        type="button"
        class="tab"
        :class="{ active: activeTab === 'programs' }"
        @click="
          programsFilterUnitId = 'TODAS';
          activeTab = 'programs';
        "
      >
        Programas académicos ({{ store.programQuotas.length }})
      </button>
    </div>

    <OrganizationDeansTab
      v-if="activeTab === 'deans'"
      @new-unit="isNewUnitModalOpen = true"
      @edit-dean="openEditDeanModal"
      @new-program-for-unit="openNewProgramModal"
      @view-programs-for-unit="viewUnitPrograms"
      @open-unit-payroll="navigateToFacultyPayroll"
      @issued-credentials="handleIssuedCredentials"
    />

    <OrganizationProgramsTab
      v-else
      :initial-unit-id="programsFilterUnitId"
      @new-program="(unitId) => openNewProgramModal(unitId)"
      @edit-program="openEditProgramModal"
    />

    <!-- MODALS -->
    <AcademicUnitFormModal
      :open="isNewUnitModalOpen"
      @close="isNewUnitModalOpen = false"
      @issued-credentials="handleIssuedCredentials"
    />
    <DeanAssignmentModal
      :open="isEditDeanModalOpen"
      :initial-unit="selectedUnitForDean"
      @close="isEditDeanModalOpen = false"
      @issued-credentials="handleIssuedCredentials"
    />
    <AcademicProgramFormModal
      :open="isNewProgramModalOpen"
      :default-unit-id="defaultUnitForProgram"
      :editing-program="editingProgramModel"
      @close="closeProgramModal"
    />

    <!-- PERSISTENT CREDENTIALS MODAL -->
    <UstaModal
      :open="!!issuedCredentials"
      :title="issuedCredentials?.title ?? 'Credenciales temporales'"
      subtitle="Entregue esta clave temporal al responsable. Solo se muestra una vez y deberá cambiarse en el primer ingreso."
      @close="issuedCredentials = null"
    >
      <template v-if="issuedCredentials">
        <div
          style="background: var(--surface-soft); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; display: grid; gap: 10px"
        >
          <div>
            <div style="font-size: 11px; color: var(--ink-soft)">Unidad académica</div>
            <b style="color: var(--navy); font-size: 13.5px">{{ issuedCredentials.unitName }}</b>
          </div>
          <div>
            <div style="font-size: 11px; color: var(--ink-soft)">Responsable</div>
            <b style="font-size: 13px">{{ issuedCredentials.fullName }}</b>
          </div>
          <div class="grid cols-2" style="gap: 10px">
            <div>
              <div style="font-size: 11px; color: var(--ink-soft); margin-bottom: 3px">
                Usuario institucional
              </div>
              <input
                :value="issuedCredentials.username"
                type="text"
                readonly
                style="font-family: var(--font-mono); font-weight: 700"
              />
            </div>
            <div>
              <div style="font-size: 11px; color: var(--ink-soft); margin-bottom: 3px">
                Contraseña temporal
              </div>
              <input
                :value="issuedCredentials.temporaryPassword"
                type="text"
                readonly
                style="font-family: var(--font-mono); font-weight: 800; color: var(--navy)"
              />
            </div>
          </div>
        </div>
      </template>
      <template #actions>
        <button type="button" class="btn accent" @click="copyIssuedCredentials">
          Copiar credenciales
        </button>
        <button type="button" class="btn primary" @click="issuedCredentials = null">
          Cerrar
        </button>
      </template>
    </UstaModal>
  </div>
</template>
