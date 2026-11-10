/** Typed readers for native form events, so templates never bind `v-model` to store state. */

type FormControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export function eventValue(event: Event): string {
  return (event.target as FormControl).value;
}

export function eventNumber(event: Event): number {
  return Number((event.target as FormControl).value) || 0;
}

export function eventChecked(event: Event): boolean {
  return (event.target as HTMLInputElement).checked;
}
