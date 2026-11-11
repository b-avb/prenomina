<script setup lang="ts">
import { usePayrollStore } from '@/stores/payroll.store';
import { eventChecked, eventNumber } from '@/utils/dom-events';

const store = usePayrollStore();
</script>

<template>
  <div class="card" style="padding: 16px 18px">
    <div class="section-label" style="margin: 0 0 6px">
      Interruptores de Reglas Normativas Institucionales de Validación
    </div>
    <p style="font-size: 12px; color: var(--ink-soft); margin: 0 0 16px">
      La Dirección de Enseñanza y Aprendizaje puede ajustar estos parámetros en tiempo real sin necesidad de soporte técnico. Los cambios recalculan de inmediato las alertas de las {{ store.units.length }} unidades académicas.
    </p>

    <div class="grid cols-2" style="gap: 14px">
      <div
        style="border: 1.5px solid var(--border); border-radius: 10px; padding: 14px; background: var(--surface-soft)"
      >
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px">
          <div>
            <span class="code-chip" style="margin-bottom: 4px">REGLA PSE · CÓD. 40108</span>
            <h3 style="margin: 4px 0; font-size: 13.5px; color: var(--navy)">
              Cálculo automático de PSE (40108 = 40104 × 0.25) sobre Posgrado
            </h3>
            <p style="font-size: 11.5px; color: var(--ink-soft); margin: 0">
              Define si las asignaturas de Posgrado (Especialización, Maestría, Doctorado) dentro de la carga ordinaria suman al cálculo automático del 25% de PSE o si solo aplica a Pregrado.
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
          Estado actual:
          {{
            store.rulesConfig.includePostgraduateInPse125
              ? 'Incluir Pregrado + Posgrado en PSE (×1.25)'
              : 'Calcular PSE automáticamente solo sobre Pregrado'
          }}
        </div>
      </div>

      <div
        style="border: 1.5px solid var(--border); border-radius: 10px; padding: 14px; background: var(--surface-soft)"
      >
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px">
          <div>
            <span class="code-chip" style="margin-bottom: 4px">ANEXO 6 · GRADUADOS</span>
            <h3 style="margin: 4px 0; font-size: 13.5px; color: var(--navy)">
              Tope Institucional de Seguimiento a Graduados (20502 / 41201)
            </h3>
            <p style="font-size: 11.5px; color: var(--ink-soft); margin: 0">
              El ANEXO 6 fija un máximo de 16 h/mes para facultades de más de un programa (como Ingeniería Mecánica con Pregrado + Maestría), aunque la suma individual por programa dé 24 h.
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
          Estado actual:
          {{
            store.rulesConfig.enforceAnnex6CapOnGraduates
              ? 'Aplicar tope duro ANEXO 6 (Máx 16 h/mes por facultad)'
              : 'Permitir suma por programa (hasta 24 h/mes con justificación)'
          }}
        </div>
      </div>

      <div
        style="border: 1.5px solid var(--border); border-radius: 10px; padding: 14px; background: var(--surface-soft)"
      >
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px">
          <div>
            <span class="code-chip" style="margin-bottom: 4px">FLUJO DE RADICACIÓN</span>
            <h3 style="margin: 4px 0; font-size: 13.5px; color: var(--navy)">
              Bloqueo de envío cuando existan alertas bloqueantes sin resolver
            </h3>
            <p style="font-size: 11.5px; color: var(--ink-soft); margin: 0">
              Impide que una Decanatura radique la prenómina si algún docente supera su horas de contrato o si una bolsa supera el tope autorizado en ANEXOS 5 y 6.
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
          Estado actual:
          {{
            store.rulesConfig.blockSubmissionWithBlockingAlerts
              ? 'Bloqueo estricto activado'
              : 'Permitir envío con justificación escrita del Decano'
          }}
        </div>
      </div>

      <div
        style="border: 1.5px solid var(--border); border-radius: 10px; padding: 14px; background: var(--surface-soft)"
      >
        <span class="code-chip" style="margin-bottom: 4px">PARÁMETROS DOCENCIA DIRECTA</span>
        <h3 style="margin: 4px 0 8px; font-size: 13.5px; color: var(--navy)">
          Umbrales de Docencia Directa (40104) y Número de Asignaturas
        </h3>
        <div class="grid cols-2" style="gap: 10px">
          <div>
            <label style="font-size: 11px; font-weight: 700; color: var(--ink-soft); display: block; margin-bottom: 4px">
              Mínimo 40104 Docente TC (h/mes)
            </label>
            <input
              :value="store.rulesConfig.minFullTimeTeachingHours"
              type="number"
              min="0"
              max="160"
              step="4"
              style="width: 100%; padding: 6px 8px; border: 1.5px solid var(--border); border-radius: 6px; font-family: var(--font-mono); font-weight: 700"
              @change="
                store.updateRulesConfig({
                  minFullTimeTeachingHours: eventNumber($event),
                })
              "
            />
          </div>
          <div>
            <label style="font-size: 11px; font-weight: 700; color: var(--ink-soft); display: block; margin-bottom: 4px">
              Máximo Espacios Académicos s/alerta
            </label>
            <input
              :value="store.rulesConfig.maxRecommendedAcademicSpaces"
              type="number"
              min="1"
              max="12"
              style="width: 100%; padding: 6px 8px; border: 1.5px solid var(--border); border-radius: 6px; font-family: var(--font-mono); font-weight: 700"
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
