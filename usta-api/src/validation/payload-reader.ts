import { ValidationError, type FieldViolation } from '../utils/app-error.js';
import { isOneOf } from './domain-enums.js';

interface StringOptions {
  /** Accept `''` as a valid value (the key must still be present). */
  allowEmpty?: boolean;
  maxLength?: number;
}

interface NumberOptions {
  min?: number;
  max?: number;
  integer?: boolean;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Accumulating JSON request body validator with zero external runtime dependencies.
 *
 * Usage: `PayloadReader.parse(body, (r) => ({ name: r.requiredString('name') }))`.
 * Accessors collect all field violations instead of failing on the first error, surfacing the
 * complete violation set as `400 VALIDATION_FAILED` (`details: FieldViolation[]`). Strings are
 * trimmed automatically; placeholder values returned on invalid fields are never observed by
 * callers because `parse` throws before returning when `violations.length > 0`.
 */
export class PayloadReader {
  private readonly source: Record<string, unknown>;
  private readonly path: string;
  private readonly violations: FieldViolation[];

  private constructor(source: Record<string, unknown>, path: string, violations: FieldViolation[]) {
    this.source = source;
    this.path = path;
    this.violations = violations;
  }

  public static parse<T>(payload: unknown, build: (reader: PayloadReader) => T): T {
    const violations: FieldViolation[] = [];
    if (!isPlainObject(payload)) {
      throw new ValidationError([{ field: '(body)', message: 'El formato de los datos enviados no es válido.' }]);
    }
    const result = build(new PayloadReader(payload, '', violations));
    if (violations.length > 0) throw new ValidationError(violations);
    return result;
  }

  public has(key: string): boolean {
    return this.source[key] !== undefined;
  }

  public requiredString(key: string, options: StringOptions = {}): string {
    const value = this.source[key];
    if (value === undefined || value === null) return this.fail(key, 'Este campo es obligatorio.', '');
    return this.readString(key, value, options) ?? '';
  }

  public optionalString(key: string, options: StringOptions = { allowEmpty: true }): string | undefined {
    const value = this.source[key];
    if (value === undefined || value === null) return undefined;
    return this.readString(key, value, { allowEmpty: true, ...options });
  }

  public optionalNullableString(key: string, options: StringOptions = { allowEmpty: true }): string | null | undefined {
    const value = this.source[key];
    if (value === undefined) return undefined;
    if (value === null) return null;
    const str = this.readString(key, value, { allowEmpty: true, ...options });
    return str === '' ? null : str;
  }

  public requiredNumber(key: string, options: NumberOptions = {}): number {
    const value = this.source[key];
    if (value === undefined || value === null) return this.fail(key, 'Este campo es obligatorio.', 0);
    return this.readNumber(key, value, options) ?? 0;
  }

  public optionalNumber(key: string, options: NumberOptions = {}): number | undefined {
    const value = this.source[key];
    if (value === undefined || value === null) return undefined;
    return this.readNumber(key, value, options);
  }

  /** Absent or `null` → `null`. */
  public nullableNumber(key: string, options: NumberOptions = {}): number | null {
    const value = this.source[key];
    if (value === undefined || value === null) return null;
    return this.readNumber(key, value, options) ?? null;
  }

  /** Absent → `undefined` (leave unchanged), `null` → `null` (clear). */
  public optionalNullableNumber(key: string, options: NumberOptions = {}): number | null | undefined {
    const value = this.source[key];
    if (value === undefined) return undefined;
    if (value === null) return null;
    return this.readNumber(key, value, options);
  }

  public requiredBoolean(key: string): boolean {
    const value = this.source[key];
    if (typeof value === 'boolean') return value;
    return this.fail(key, value === undefined ? 'Este campo es obligatorio.' : 'Seleccione Sí o No.', false);
  }

  public optionalBoolean(key: string): boolean | undefined {
    const value = this.source[key];
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'boolean') return value;
    return this.fail(key, 'Seleccione Sí o No.', undefined);
  }

  public optionalNullableBoolean(key: string): boolean | null | undefined {
    const value = this.source[key];
    if (value === undefined) return undefined;
    if (value === null) return null;
    if (typeof value === 'boolean') return value;
    return this.fail(key, 'Seleccione Sí o No.', undefined);
  }

  public requiredEnum<T extends string>(key: string, allowed: readonly T[]): T {
    const value = this.source[key];
    if (isOneOf(value, allowed)) return value;
    const message = value === undefined ? 'Campo requerido.' : this.enumMessage(allowed);
    return this.fail(key, message, allowed[0] as T);
  }

  public optionalEnum<T extends string>(key: string, allowed: readonly T[]): T | undefined {
    const value = this.source[key];
    if (value === undefined || value === null) return undefined;
    if (isOneOf(value, allowed)) return value;
    return this.fail(key, this.enumMessage(allowed), undefined);
  }

  /** Absent → `undefined`, `null` → `null`, otherwise one of `allowed`. */
  public optionalNullableEnum<T extends string>(key: string, allowed: readonly T[]): T | null | undefined {
    const value = this.source[key];
    if (value === undefined) return undefined;
    if (value === null) return null;
    if (isOneOf(value, allowed)) return value;
    return this.fail(key, this.enumMessage(allowed), undefined);
  }

  public objectArray<T>(key: string, build: (item: PayloadReader) => T): T[] {
    const value = this.source[key];
    if (!Array.isArray(value)) {
      return this.fail(key, value === undefined ? 'Campo requerido.' : 'Debe ser una lista.', []);
    }
    return value.map((item, index) => this.nested(`${this.qualify(key)}[${index}]`, item, build));
  }

  public optionalObjectArray<T>(key: string, build: (item: PayloadReader) => T): T[] | undefined {
    return this.source[key] === undefined ? undefined : this.objectArray(key, build);
  }

  /** Reads a JSON object used as a dictionary (e.g. allocations keyed by SAC code). */
  public optionalRecord<T>(key: string, build: (item: PayloadReader, entryKey: string) => T): Record<string, T> | undefined {
    const value = this.source[key];
    if (value === undefined || value === null) return undefined;
    if (!isPlainObject(value)) return this.fail(key, 'Debe ser un objeto.', undefined);
    const result: Record<string, T> = {};
    for (const [entryKey, entry] of Object.entries(value)) {
      result[entryKey] = this.nested(`${this.qualify(key)}.${entryKey}`, entry, (reader) =>
        build(reader, entryKey),
      );
    }
    return result;
  }

  private nested<T>(path: string, value: unknown, build: (reader: PayloadReader) => T): T {
    const source = isPlainObject(value) ? value : {};
    if (!isPlainObject(value)) this.violations.push({ field: path, message: 'Debe ser un objeto.' });
    return build(new PayloadReader(source, path, this.violations));
  }

  private readString(key: string, value: unknown, options: StringOptions): string | undefined {
    if (typeof value !== 'string') return this.fail(key, 'Debe ser texto.', undefined);
    const trimmed = value.trim();
    if (!options.allowEmpty && trimmed === '') return this.fail(key, 'No puede estar vacío.', undefined);
    if (options.maxLength !== undefined && trimmed.length > options.maxLength) {
      return this.fail(key, `Máximo ${options.maxLength} caracteres.`, undefined);
    }
    return trimmed;
  }

  private readNumber(key: string, value: unknown, options: NumberOptions): number | undefined {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return this.fail(key, 'Debe ser un número.', undefined);
    }
    if (options.integer && !Number.isInteger(value)) {
      return this.fail(key, 'Debe ser un número entero.', undefined);
    }
    if (options.min !== undefined && value < options.min) {
      return this.fail(key, `Debe ser mayor o igual a ${options.min}.`, undefined);
    }
    if (options.max !== undefined && value > options.max) {
      return this.fail(key, `Debe ser menor o igual a ${options.max}.`, undefined);
    }
    return value;
  }

  private enumMessage(allowed: readonly string[]): string {
    return `Debe ser uno de: ${allowed.join(', ')}.`;
  }

  private qualify(key: string): string {
    return this.path ? `${this.path}.${key}` : key;
  }

  private fail<T>(key: string, message: string, placeholder: T): T {
    this.violations.push({ field: this.qualify(key), message });
    return placeholder;
  }
}
