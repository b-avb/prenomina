/** Typed readers for native form events, so templates never bind `v-model` to store state. */

type FormControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export function eventValue(event: Event): string {
  return (event.target as FormControl).value;
}

export function eventNumber(event: Event): number {
  return Number((event.target as FormControl).value) || 0;
}

/** Parses a numeric input value, returning `null` when cleared so optional caps can be unset. */
export function eventNullableNumber(event: Event): number | null {
  const raw = (event.target as FormControl).value.trim();
  if (raw === '') return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function eventChecked(event: Event): boolean {
  return (event.target as HTMLInputElement).checked;
}
