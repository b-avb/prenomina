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

  const rawTotal =
    teaching40104 + pse40108 + otherTeaching + research + socialOutreach + management;
  const pct = (hours: number) => (rawTotal > 0 ? Math.round((hours / rawTotal) * 100) : 0);

  return [
    {
      label: 'Orientación de espacios académicos (40104)',
      hours: teaching40104,
      pct: pct(teaching40104),
      color: 'var(--blue)',
    },
    {
      label: 'Preparación, seguimiento y evaluación — PSE 25 % (40108)',
      hours: pse40108,
      pct: pct(pse40108),
      color: 'var(--success)',
    },
    {
      label: 'Enseñanza y aprendizaje (currículo, SEA, Saber Pro, tutorías)',
      hours: otherTeaching,
      pct: pct(otherTeaching),
      color: 'var(--cerulean)',
    },
    {
      label: 'Investigación e innovación (proyectos, SICDDI, opciones de grado)',
      hours: research,
      pct: pct(research),
      color: 'var(--navy)',
    },
    {
      label: 'Gestión académica y aseguramiento de la calidad',
      hours: management,
      pct: pct(management),
      color: 'var(--gold)',
    },
    {
      label: 'Proyección social y extensión (graduados, prácticas, consultorios)',
      hours: socialOutreach,
      pct: pct(socialOutreach),
      color: 'var(--warning)',
    },
  ];
});

const isSectionalUnstarted = computed(
  () => store.units.length > 0 && store.units.every((u) => store.isUnitUnstarted(u.id)),
);

function getQuotaBadgeClass(allocated: number, cap: number): string {
  if (allocated > cap) return 'reprobado';
  if (allocated === cap) return 'aprobado';
  if (allocated === 0 && isSectionalUnstarted.value) return 'retirado';
  return 'pendiente';
}

function getQuotaBadgeLabel(allocated: number, cap: number): string {
  if (allocated === cap) return 'Cumple';
  if (allocated > cap) return `Exceso (+${allocated - cap} h)`;
  if (allocated === 0 && isSectionalUnstarted.value) return 'Sin asignar';
  return `Faltan ${cap - allocated} h`;
}

const institutionalQuotasSummary = computed(() => [
  {
    code: '30411',
    name: 'Aseguramiento de la calidad (Anexo 5)',
    allocated: store.units.reduce((acc, u) => acc + store.sumCodeInUnit(u.id, '30411'), 0),
    cap: store.units.reduce((acc, u) => acc + u.qualityCap30411, 0),
  },
  {
    code: '40106',
    name: 'Líder de currículo (Anexo 5)',
    allocated: store.units.reduce((acc, u) => acc + store.sumCodeInUnit(u.id, '40106'), 0),
    cap: store.units.reduce((acc, u) => acc + u.curriculumCap40106, 0),
  },
  {
    code: '40109',
    name: 'Pruebas académicas SEA (Anexo 5)',
    allocated: store.units.reduce((acc, u) => acc + store.sumCodeInUnit(u.id, '40109'), 0),
    cap: store.units.reduce((acc, u) => acc + u.seaCap40109, 0),
  },
  {
    code: '40127',
    name: 'Pruebas Saber Pro (Anexo 5)',
    allocated: store.units.reduce((acc, u) => acc + store.sumCodeInUnit(u.id, '40127'), 0),
    cap: store.units.reduce((acc, u) => acc + u.saberProCap40127, 0),
  },
  {
    code: '20502',
    name: 'Gestión de graduados (Anexo 6)',
    allocated: store.units.reduce((acc, u) => acc + store.sumCodeInUnit(u.id, '20502'), 0),
    cap: store.units.reduce((acc, u) => acc + u.graduatesCap20502, 0),
  },
]);
</script>

<template>
  <div class="grid cols-2">
    <div class="card">
      <div class="section-label" style="margin-top: 0">
        Horas por función sustantiva ({{ store.activePeriod }})
      </div>
      <p style="font-size: 12px; color: var(--ink-soft); margin: 0 0 16px">
        Consolidado sobre {{ totalSectionalTeachers }} docentes en
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
        Bolsas institucionales (Anexos 5 y 6)
      </div>
      <p style="font-size: 12px; color: var(--ink-soft); margin: 0 0 16px">
        Horas asignadas frente a los topes institucionales de la Seccional Tunja.
      </p>

      <table class="compact-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Bolsa institucional</th>
            <th>Asignadas</th>
            <th>Tope seccional</th>
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
                :class="getQuotaBadgeClass(quota.allocated, quota.cap)"
              >
                {{ getQuotaBadgeLabel(quota.allocated, quota.cap) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
