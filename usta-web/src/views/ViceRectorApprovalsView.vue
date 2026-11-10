<script setup lang="ts">
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

const canDecideApprovals = computed(
  () => store.activeRole === 'vice_rector' || store.activeRole === 'director',
);

const filteredRequests = computed(() => {
  return store.approvalRequests.filter((req) => {
    if (store.activeRole === 'dean' && req.unitId !== store.activeUnitId) {
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

function submitDecision(status: 'Avalado' | 'Con Observaciones' | 'Rechazado'): void {
  if (!selectedRequest.value) return;
  store.decideApprovalRequest(selectedRequest.value.id, status, observationText.value);
  selectedRequest.value = null;
}

function navigateToTeacherPayroll(req: ApprovalRequestAnnex3): void {
  store.selectUnit(req.unitId);
  router.push({
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
          VICERRECTORÍA ACADÉMICA & DIRECCIÓN E&A · PRE-AVAL DIGITAL SIN DESCARGAR FORMATOS (RF-25, RF-26)
        </div>
        <h1 class="screen-title" style="margin: 0; font-size: 22px">
          Bandeja de Pre-Aval de Códigos Especiales (ANEXO 3)
        </h1>
      </div>
    </div>

    <div class="card" style="padding: 16px 18px">
      <div
        style="display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 14px"
      >
        <div style="display: flex; gap: 6px; flex-wrap: wrap">
          <button
            v-for="st in ['TODOS', 'Pendiente', 'Avalado', 'Con Observaciones', 'Rechazado']"
            :key="st"
            class="dia-chip"
            style="height: 28px; font-size: 11.5px"
            :class="{ active: statusFilter === st }"
            @click="statusFilter = st"
          >
            {{ st }}
          </button>
        </div>

        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por docente, código (10212, 20223…) o facultad…"
          style="padding: 6px 11px; border: 1.5px solid var(--border); border-radius: 7px; font-size: 12px; min-width: 260px"
        />
      </div>

      <table class="compact-table">
        <thead>
          <tr>
            <th>Facultad y Programa</th>
            <th>Docente Asignado</th>
            <th>Código Especial (ANEXO 3)</th>
            <th>Horas/Mes</th>
            <th>Relación de Proyectos / Curso / Soporte</th>
            <th>Estado Pre-Aval</th>
            <th style="text-align: right">Decisión en Línea</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="req in filteredRequests" :key="req.id">
            <td data-label="Facultad">
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
            <td data-label="Código Especial">
              <span class="code-chip">{{ req.code }}</span>
              <div style="font-size: 11.5px; font-weight: 600; margin-top: 3px">
                {{ req.codeName.replace('TUNJA ', '') }}
              </div>
            </td>
            <td data-label="Horas/Mes">
              <b style="font-family: var(--font-mono); font-size: 14px; color: var(--navy)">
                {{ req.requestedHours }} h
              </b>
            </td>
            <td data-label="Soporte ANEXO 3">
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
              <div style="font-family: var(--font-mono); font-size: 10.5px; color: var(--blue)">
                📎 {{ req.attachmentUrl }}
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
            <td data-label="Decisión" style="text-align: right; white-space: nowrap">
              <div style="display: flex; gap: 5px; justify-content: flex-end">
                <button
                  class="btn ghost small"
                  title="Imprimir / Exportar PDF Formato Oficial ANEXO 3 USTA Tunja"
                  @click="printOfficialAnnex3Format(req, store.activePeriod)"
                >
                  🖨 Formato PDF
                </button>
                <button
                  v-if="canDecideApprovals"
                  class="btn primary small"
                  @click="
                    store.decideApprovalRequest(
                      req.id,
                      'Avalado',
                      'Cumple con los soportes del ANEXO 3',
                    )
                  "
                >
                  ✓ Avalar
                </button>
                <button
                  v-if="canDecideApprovals"
                  class="btn ghost small"
                  @click="openDecisionModal(req)"
                >
                  Observar / Rechazar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <UstaModal
      :open="Boolean(selectedRequest)"
      :title="`Revisión de Solicitud ANEXO 3 — Código ${selectedRequest?.code ?? ''}`"
      :subtitle="`Docente: <b>${selectedRequest?.teacherName ?? ''}</b> (${selectedRequest?.unitName ?? ''})`"
      @close="selectedRequest = null"
    >
      <div class="field">
        <label>Observación de la Vicerrectoría Académica / Dirección E&A</label>
        <textarea
          v-model="observationText"
          rows="5"
          style="min-height: 150px"
          placeholder="Indica el ajuste requerido en horas o en los soportes del comité curricular…"
        ></textarea>
      </div>

      <template #footer>
        <button class="btn ghost" @click="selectedRequest = null">Cancelar</button>
        <button class="btn accent" @click="submitDecision('Con Observaciones')">
          Devolver con Observaciones
        </button>
        <button class="btn danger" @click="submitDecision('Rechazado')">
          Rechazar Solicitud
        </button>
      </template>
    </UstaModal>
  </div>
</template>
