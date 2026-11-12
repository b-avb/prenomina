<script setup lang="ts">
/**
 * Annex 3 Vice-Rectorate approval inbox scoped to managed units for Deans and
 * open across all faculties for executive review, attachment inspection, and PDF printing.
 */
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import UstaModal from '@/components/ui/UstaModal.vue';
import { printOfficialAnnex3Format } from '@/services/exporters';
import { usePayrollStore } from '@/stores/payroll.store';
import type { ApprovalRequestAnnex3 } from '@usta/domain';

const store = usePayrollStore();
const router = useRouter();

const statusFilter = ref<string>('TODOS');
const searchQuery = ref<string>('');
const selectedRequest = ref<ApprovalRequestAnnex3 | null>(null);
const observationText = ref<string>('');
const isDeciding = ref(false);

const canDecideApprovals = computed(
  () => store.activeRole === 'vice_rector' || store.activeRole === 'director',
);

const filteredRequests = computed(() => {
  return store.approvalRequests.filter((req) => {
    if (
      store.activeRole === 'dean' &&
      store.managedUnitIds.length > 0 &&
      !store.managedUnitIds.includes(req.unitId)
    ) {
      return false;
    }
    const matchesStatus =
      statusFilter.value === 'TODOS' || req.status === statusFilter.value;
    const query = searchQuery.value.trim().toLowerCase();
    const matchesQuery =
      !query ||
      req.teacherName.toLowerCase().includes(query) ||
      req.teacherDocumentId.toLowerCase().includes(query) ||
      req.unitName.toLowerCase().includes(query) ||
      req.code.toLowerCase().includes(query);
    return matchesStatus && matchesQuery;
  });
});

function openDecisionModal(req: ApprovalRequestAnnex3): void {
  selectedRequest.value = req;
  observationText.value = req.viceRectorNote ?? '';
}

async function submitDecision(
  status: 'Avalado' | 'Con Observaciones' | 'Rechazado',
): Promise<void> {
  if (!selectedRequest.value) return;
  isDeciding.value = true;
  try {
    const res = await store.decideApprovalRequest(
      selectedRequest.value.id,
      status,
      observationText.value.trim() || undefined,
    );
    if (res.ok) {
      selectedRequest.value = null;
    }
  } finally {
    isDeciding.value = false;
  }
}

function navigateToTeacherPayroll(req: ApprovalRequestAnnex3): void {
  store.selectUnit(req.unitId);
  void router.push({
    path: '/dean/payroll',
    query: { teacherId: req.teacherId, documentId: req.teacherDocumentId },
  });
}
</script>

<template>
  <div>
    <div class="page-top">
      <div>
        <div class="eyebrow-tag" style="margin-bottom: 3px">
          VICERRECTORÍA ACADÉMICA · {{ store.activePeriod }}
        </div>
        <h1 class="screen-title" style="margin: 0; font-size: 22px">
          Solicitudes de aval (Anexo 3)
        </h1>
      </div>
    </div>

    <div class="card" style="padding: 16px 18px">
      <div
        style="display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 14px"
      >
        <div style="display: flex; gap: 6px; flex-wrap: wrap">
          <button
            v-for="st in [
              { id: 'TODOS', label: 'Todas' },
              { id: 'Pendiente', label: 'Pendientes' },
              { id: 'Avalado', label: 'Avaladas' },
              { id: 'Con Observaciones', label: 'Con observaciones' },
              { id: 'Rechazado', label: 'Rechazadas' },
            ]"
            :key="st.id"
            type="button"
            class="dia-chip"
            style="height: 28px; font-size: 11.5px"
            :class="{ active: statusFilter === st.id }"
            @click="statusFilter = st.id"
          >
            {{ st.label }}
          </button>
        </div>

        <input
          v-model="searchQuery"
          type="text"
          class="control-sm"
          placeholder="Buscar por docente, código o unidad…"
          style="min-width: 260px"
        />
      </div>

      <table class="compact-table">
        <thead>
          <tr>
            <th>Unidad y programa</th>
            <th>Docente</th>
            <th>Código SAC</th>
            <th>Horas/mes</th>
            <th>Detalle y soporte</th>
            <th>Estado</th>
            <th style="text-align: right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredRequests.length === 0">
            <td colspan="7" class="empty-note" style="padding: 28px 16px; text-align: center">
              No hay solicitudes de aval para los criterios seleccionados.
            </td>
          </tr>
          <tr v-for="req in filteredRequests" :key="req.id">
            <td data-label="Unidad">
              <b style="color: var(--navy)">{{ req.unitName }}</b>
              <div style="font-size: 11px; color: var(--ink-soft)">{{ req.programName }}</div>
              <div
                style="font-family: var(--font-mono); font-size: 10px; color: var(--ink-faint)"
              >
                Radicado: {{ req.requestedAt }}
              </div>
            </td>
            <td data-label="Docente">
              <b
                style="color: var(--navy); cursor: pointer"
                @click="navigateToTeacherPayroll(req)"
              >
                {{ req.teacherName }}
              </b>
              <div style="font-family: var(--font-mono); font-size: 11px; color: var(--ink-soft)">
                CC {{ req.teacherDocumentId }}
              </div>
            </td>
            <td data-label="Código SAC">
              <span class="code-chip">{{ req.code }}</span>
              <div style="font-size: 11.5px; font-weight: 600; margin-top: 3px">
                {{ req.codeName.replace('TUNJA ', '') }}
              </div>
            </td>
            <td data-label="Horas/mes">
              <b style="font-family: var(--font-mono); font-size: 14px; color: var(--navy)">
                {{ req.requestedHours }} h
              </b>
            </td>
            <td data-label="Detalle y soporte">
              <div
                v-for="(det, i) in req.projectDetails"
                :key="i"
                style="background: var(--surface-soft); padding: 5px 8px; border-radius: 7px; margin-bottom: 4px; font-size: 11.5px"
              >
                <b>{{ det.title }}</b> ({{ det.hours }} h)<br />
                <span style="color: var(--ink-soft)">
                  {{ det.projectType }} · {{ det.studentsOrCourse }} ·
                  <b>{{ det.committeeApprovalMinute }}</b>
                </span>
              </div>
              <div v-if="req.attachmentUrl" style="margin-top: 4px">
                <button
                  type="button"
                  class="btn ghost small"
                  style="padding: 2px 8px; font-size: 11px; color: var(--cerulean)"
                  @click="store.openApprovalAttachment(req.attachmentUrl)"
                >
                  Ver soporte
                </button>
              </div>
              <div v-else style="font-size: 10.5px; color: var(--ink-faint)">
                Sin soporte adjunto
              </div>
              <div
                v-if="req.viceRectorNote"
                style="margin-top: 4px; font-size: 11px; color: var(--danger); font-weight: 600"
              >
                Observación: {{ req.viceRectorNote }}
              </div>
            </td>
            <td data-label="Estado">
              <span
                class="badge"
                :class="
                  req.status === 'Avalado'
                    ? 'aprobado'
                    : req.status === 'Con Observaciones' || req.status === 'Rechazado'
                      ? 'reprobado'
                      : 'pendiente'
                "
              >
                {{ req.status }}
              </span>
              <div
                v-if="req.decidedBy"
                style="font-size: 10px; color: var(--ink-soft); margin-top: 3px"
              >
                {{ req.decidedBy }}
              </div>
            </td>
            <td data-label="Acciones" style="text-align: right; white-space: nowrap">
              <div style="display: flex; gap: 5px; justify-content: flex-end">
                <button
                  type="button"
                  class="btn ghost small"
                  title="Imprimir o guardar formato Anexo 3 en PDF"
                  @click="printOfficialAnnex3Format(req, store.activePeriod)"
                >
                  Formato PDF
                </button>
                <button
                  v-if="canDecideApprovals"
                  type="button"
                  class="btn primary small"
                  @click="
                    store.decideApprovalRequest(
                      req.id,
                      'Avalado',
                      'Avalado según soportes del Anexo 3',
                    )
                  "
                >
                  Avalar
                </button>
                <button
                  v-if="canDecideApprovals"
                  type="button"
                  class="btn ghost small"
                  @click="openDecisionModal(req)"
                >
                  Observar o rechazar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <UstaModal
      :open="Boolean(selectedRequest)"
      :title="`Revisar solicitud · Código ${selectedRequest?.code ?? ''}`"
      :subtitle="`${selectedRequest?.teacherName ?? ''} · ${selectedRequest?.unitName ?? ''}`"
      @close="selectedRequest = null"
    >
      <div class="field">
        <label>Observaciones</label>
        <textarea
          v-model="observationText"
          rows="5"
          style="min-height: 150px"
          placeholder="Indique los ajustes requeridos en horas o soportes…"
        ></textarea>
      </div>

      <template #footer>
        <button type="button" class="btn ghost" @click="selectedRequest = null">
          Cancelar
        </button>
        <button
          type="button"
          class="btn accent"
          :disabled="isDeciding"
          @click="submitDecision('Con Observaciones')"
        >
          Devolver con observaciones
        </button>
        <button
          type="button"
          class="btn danger"
          :disabled="isDeciding"
          @click="submitDecision('Rechazado')"
        >
          Rechazar solicitud
        </button>
      </template>
    </UstaModal>
  </div>
</template>
