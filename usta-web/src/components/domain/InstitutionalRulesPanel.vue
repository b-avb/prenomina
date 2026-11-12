<script setup lang="ts">
import { usePayrollStore } from '@/stores/payroll.store';
import { eventChecked, eventNumber } from '@/utils/dom-events';

const store = usePayrollStore();
</script>

<template>
  <div class="card" style="padding: 16px 18px">
    <div class="section-label" style="margin: 0 0 6px">
      Reglas de validación institucional
    </div>
    <p style="font-size: 12px; color: var(--ink-soft); margin: 0 0 16px">
      Ajuste los criterios generales que aplican sobre las {{ store.units.length }} unidades académicas.
    </p>

    <div class="grid cols-2" style="gap: 14px">
      <div
        style="border: 1.5px solid var(--border); border-radius: 10px; padding: 14px; background: var(--surface-soft)"
      >
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px">
          <div>
            <span class="code-chip" style="margin-bottom: 4px">Código 40108 · PSE</span>
            <h3 style="margin: 4px 0; font-size: 13.5px; color: var(--navy)">
              Incluir posgrado en el cálculo automático de PSE (25 %)
            </h3>
            <p style="font-size: 11.5px; color: var(--ink-soft); margin: 0">
              Define si los módulos de posgrado dentro de la carga ordinaria suman al 25 % de preparación, seguimiento y evaluación.
            </p>
          </div>
          <label class="toggle" style="flex-shrink: 0">
            <input
              :checked="store.rulesConfig.includePostgraduateInPse125"
              type="checkbox"
              @change="
                store.updateRulesConfig({
                  includePostgraduateInPse125: eventChecked($event),
                })
              "
            />
            <span class="toggle__track"></span>
          </label>
        </div>
        <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: var(--blue)">
          {{
            store.rulesConfig.includePostgraduateInPse125
              ? 'Activo: aplica sobre pregrado y posgrado'
              : 'Inactivo: aplica solo sobre pregrado'
          }}
        </div>
      </div>

      <div
        style="border: 1.5px solid var(--border); border-radius: 10px; padding: 14px; background: var(--surface-soft)"
      >
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px">
          <div>
            <span class="code-chip" style="margin-bottom: 4px">Anexo 6 · Graduados</span>
            <h3 style="margin: 4px 0; font-size: 13.5px; color: var(--navy)">
              Tope de seguimiento a graduados por facultad (20502)
            </h3>
            <p style="font-size: 11.5px; color: var(--ink-soft); margin: 0">
              Limita a 16 h/mes las facultades con más de un programa activo, conforme al Anexo 6.
            </p>
          </div>
          <label class="toggle" style="flex-shrink: 0">
            <input
              :checked="store.rulesConfig.enforceAnnex6CapOnGraduates"
              type="checkbox"
              @change="
                store.updateRulesConfig({
                  enforceAnnex6CapOnGraduates: eventChecked($event),
                })
              "
            />
            <span class="toggle__track"></span>
          </label>
        </div>
        <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: var(--blue)">
          {{
            store.rulesConfig.enforceAnnex6CapOnGraduates
              ? 'Activo: máximo 16 h/mes por facultad'
              : 'Inactivo: permite suma por programa con justificación'
          }}
        </div>
      </div>

      <div
        style="border: 1.5px solid var(--border); border-radius: 10px; padding: 14px; background: var(--surface-soft)"
      >
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px">
          <div>
            <span class="code-chip" style="margin-bottom: 4px">Radicación</span>
            <h3 style="margin: 4px 0; font-size: 13.5px; color: var(--navy)">
              Bloquear envío cuando existan alertas bloqueantes
            </h3>
            <p style="font-size: 11.5px; color: var(--ink-soft); margin: 0">
              Impide radicar la prenómina si algún docente supera sus horas contractuales o si una bolsa excede el tope de los Anexos 5 y 6.
            </p>
          </div>
          <label class="toggle" style="flex-shrink: 0">
            <input
              :checked="store.rulesConfig.blockSubmissionWithBlockingAlerts"
              type="checkbox"
              @change="
                store.updateRulesConfig({
                  blockSubmissionWithBlockingAlerts: eventChecked($event),
                })
              "
            />
            <span class="toggle__track"></span>
          </label>
        </div>
        <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: var(--blue)">
          {{
            store.rulesConfig.blockSubmissionWithBlockingAlerts
              ? 'Activo: exige resolver alertas bloqueantes antes de radicar'
              : 'Inactivo: permite radicar con justificación escrita'
          }}
        </div>
      </div>

      <div
        style="border: 1.5px solid var(--border); border-radius: 10px; padding: 14px; background: var(--surface-soft)"
      >
        <span class="code-chip" style="margin-bottom: 4px">Docencia directa</span>
        <h3 style="margin: 4px 0 8px; font-size: 13.5px; color: var(--navy)">
          Umbrales de orientación presencial (40104)
        </h3>
        <div class="grid cols-2" style="gap: 10px">
          <div class="field field--sm">
            <label>Mínimo 40104 en tiempo completo (h/mes)</label>
            <input
              :value="store.rulesConfig.minFullTimeTeachingHours"
              type="number"
              min="0"
              max="160"
              step="4"
              @change="
                store.updateRulesConfig({
                  minFullTimeTeachingHours: eventNumber($event),
                })
              "
            />
          </div>
          <div class="field field--sm">
            <label>Máximo de espacios académicos sin alerta</label>
            <input
              :value="store.rulesConfig.maxRecommendedAcademicSpaces"
              type="number"
              min="1"
              max="12"
              @change="
                store.updateRulesConfig({
                  maxRecommendedAcademicSpaces: eventNumber($event),
                })
              "
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
