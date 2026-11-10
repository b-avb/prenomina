import { usePayrollStore } from '@/stores/payroll.store';

/** Computes the next academic semester code (e.g. `2026-2` -> `2027-1`, `2027-1` -> `2027-2`). */
export function suggestNextPeriodCode(currentPeriod: string): string {
  const match = /^(\d{4})-([12])$/.exec(currentPeriod.trim());
  if (!match) {
    const nextYear = new Date().getFullYear() + 1;
    return `${nextYear}-1`;
  }
  const year = Number(match[1]);
  const semester = Number(match[2]);
  return semester === 1 ? `${year}-2` : `${year + 1}-1`;
}

/** Period `<select>` handler: loads the chosen period and reverts the control if it fails. */
export function usePeriodSelect() {
  const store = usePayrollStore();

  async function onPeriodChange(event: Event): Promise<void> {
    const select = event.target as HTMLSelectElement;
    const loaded = await store.switchPeriod(select.value);
    if (!loaded) select.value = store.activePeriod;
  }

  return { onPeriodChange, suggestNextPeriodCode };
}
