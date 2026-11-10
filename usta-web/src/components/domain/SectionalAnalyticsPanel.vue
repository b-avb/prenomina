<script setup lang="ts">
import { computed } from 'vue';
import { usePayrollStore } from '@/stores/payroll.store';

const store = usePayrollStore();

const totalSectionalTeachers = computed(() => store.teachers.length);

const sectionalAnalytics = computed(() => {
  let teaching40104 = 0;
  let pse40108 = 0;
  let research = 0;
  let socialOutreach = 0;
  let management = 0;
  let otherTeaching = 0;

  for (const teacher of store.teachers) {
    teaching40104 += store.computeHours40104(teacher);
    pse40108 += store.getEffectivePse(teacher);
    for (const allocation of Object.values(teacher.allocations)) {
      if (allocation.code === '40104' || allocation.code === '40108') continue;
      const definition = store.sacCodes.find((c) => c.code === allocation.code);
      const hours = Number(allocation.hours) || 0;
      if (!definition || definition.substantiveFunction === 'Enseñanza-Aprendizaje') {
        otherTeaching += hours;
      } else if (definition.substantiveFunction === 'Investigación') {
        research += hours;
      } else if (definition.substantiveFunction === 'Proyección Social') {
        socialOutreach += hours;
      } else if (definition.substantiveFunction === 'Gestión Académica') {
        management += hours;
      }
    }
  }

  const total = Math.max(
    1,
    teaching40104 + pse40108 + otherTeaching + research + socialOutreach + management,
  );

  return [
    {
      label: 'Orientación de Espacios Académicos (40104)',
      hours: teaching40104,
      pct: Math.round((teaching40104 / total) * 100),
      color: 'var(--blue)',
    },
    {
      label: 'Preparación, Seguimiento y Evaluación - PSE 25% (40108)',
      hours: pse40108,
      pct: Math.round((pse40108 / total) * 100),
      color: 'var(--success)',
    },
    {
      label: 'Enseñanza y Aprendizaje (Currículo, SEA, Saber Pro, Tutorías)',
      hours: otherTeaching,
      pct: Math.round((otherTeaching / total) * 100),
      color: 'var(--cerulean)',
    },
    {
      label: 'Investigación e Innovación (Proyectos, SICDDI, Opciones de Grado)',
      hours: research,
      pct: Math.round((research / total) * 100),
      color: 'var(--navy)',
    },
    {
      label: 'Gestión Académica y Aseguramiento de la Calidad (Decanos, Calidad)',
      hours: management,
      pct: Math.round((management / total) * 100),
      color: 'var(--gold)',
    },
    {
      label: 'Proyección Social y Extensión (Graduados, Prácticas, Consultorios)',
      hours: socialOutreach,
      pct: Math.round((socialOutreach / total) * 100),
      color: 'var(--warning)',
    },
  ];
});

const institutionalQuotasSummary = computed(() => [
  {
    code: '30411',
    name: 'Aseguramiento de la Calidad (ANEXO 5)',
    allocated: store.units.reduce((acc, u) => acc + store.sumCodeInUnit(u.id, '30411'), 0),
    cap: store.units.reduce((acc, u) => acc + u.qualityCap30411, 0),
  },
  {
    code: '40106',
    name: 'Líder de Currículo (ANEXO 5)',
    allocated: store.units.reduce((acc, u) => acc + store.sumCodeInUnit(u.id, '40106'), 0),
    cap: store.units.reduce((acc, u) => acc + u.curriculumCap40106, 0),
  },
  {
    code: '40109',
    name: 'Pruebas Académicas SEA (ANEXO 5)',
    allocated: store.units.reduce((acc, u) => acc + store.sumCodeInUnit(u.id, '40109'), 0),
    cap: store.units.reduce((acc, u) => acc + u.seaCap40109, 0),
  },
  {
    code: '40127',
    name: 'Pruebas Saber Pro (ANEXO 5)',
    allocated: store.units.reduce((acc, u) => acc + store.sumCodeInUnit(u.id, '40127'), 0),
    cap: store.units.reduce((acc, u) => acc + u.saberProCap40127, 0),
  },
  {
    code: '20502',
    name: 'Gestión de Graduados (ANEXO 6)',
    allocated: store.units.reduce((acc, u) => acc + store.sumCodeInUnit(u.id, '20502'), 0),
    cap: store.units.reduce((acc, u) => acc + u.graduatesCap20502, 0),
  },
]);
</script>

<template>
  <div class="grid cols-2">
    <div class="card">
      <div class="section-label" style="margin-top: 0">
        Distribución Seccional de Horas por Función Sustantiva ({{ store.activePeriod }})
      </div>
      <p style="font-size: 12px; color: var(--ink-soft); margin: 0 0 16px">
        Consolidado en tiempo real sobre {{ totalSectionalTeachers }} docentes registrados en las
        {{ store.units.length }} unidades académicas.
      </p>

      <div v-for="item in sectionalAnalytics" :key="item.label" style="margin-bottom: 14px">
        <div
          style="display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 5px"
        >
          <b style="color: var(--navy)">{{ item.label }}</b>
          <span style="font-family: var(--font-mono); font-weight: 700">
            {{ item.hours.toLocaleString('es-CO') }} h ({{ item.pct }}%)
          </span>
        </div>
        <div class="hours-gauge__track" style="height: 10px">
          <div
            class="hours-gauge__fill"
            :style="{ width: `${item.pct}%`, background: item.color }"
          ></div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="section-label" style="margin-top: 0">
        Cumplimiento Seccional de Bolsas Institucionales (ANEXOS 5 y 6)
      </div>
      <p style="font-size: 12px; color: var(--ink-soft); margin: 0 0 16px">
        Sumatoria global de horas asignadas frente a los topes institucionales de la Seccional Tunja.
      </p>

      <table class="compact-table">
        <thead>
          <tr>
            <th>Código SAC</th>
            <th>Bolsa Institucional</th>
            <th>Horas Asignadas</th>
            <th>Tope Seccional</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="quota in institutionalQuotasSummary" :key="quota.code">
            <td><span class="code-chip">{{ quota.code }}</span></td>
            <td><b>{{ quota.name }}</b></td>
            <td style="font-family: var(--font-mono); font-weight: 700">{{ quota.allocated }} h</td>
            <td style="font-family: var(--font-mono)">{{ quota.cap }} h</td>
            <td>
              <span
                class="badge"
                :class="quota.allocated === quota.cap ? 'aprobado' : 'pendiente'"
              >
                {{
                  quota.allocated === quota.cap
                    ? '100% cuadrado'
                    : `Dif: ${quota.allocated - quota.cap} h`
                }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
