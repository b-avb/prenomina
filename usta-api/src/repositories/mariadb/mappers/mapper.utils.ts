import type { Flag } from '../../../database/database.types.js';

/** Shared row ⇄ domain conversion helpers used by every mapper. */

export const toFlag = (value: boolean): Flag => (value ? 1 : 0);

export const fromFlag = (value: Flag | number): boolean => value === 1;

export const toNullableFlag = (value: boolean | undefined): Flag | null =>
  value === undefined ? null : toFlag(value);

export const fromNullableFlag = (value: Flag | number | null): boolean | null =>
  value === null ? null : fromFlag(value);

export const toIsoString = (value: Date): string => value.toISOString();

/** `DATE` columns are read at UTC midnight (`timezone: 'Z'`). */
export const toDateOnly = (value: Date): string => value.toISOString().slice(0, 10);

export const nullable = <T>(value: T | undefined): T | null => (value === undefined ? null : value);

type DefinedProps<T> = { [K in keyof T]?: NonNullable<T[K]> };

/**
 * Keeps only the entries whose value is neither `null` nor `undefined`, so optional
 * domain properties are omitted instead of being serialized as `null`.
 */
export function definedProps<T extends Record<string, unknown>>(props: T): DefinedProps<T> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value !== null && value !== undefined) result[key] = value;
  }
  return result as DefinedProps<T>;
}
