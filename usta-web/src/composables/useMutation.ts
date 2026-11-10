import { computed, ref, toRaw } from 'vue';
import type { ApiErrorCode } from '@usta/domain';
import { ApiError } from '@/services/api.client';
import { useToast, type ToastItem } from './useToast';

export type MutationResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };

export type SuccessMessage<T> = string | ((result: T) => string);

interface MutationRequest<T> {
  /** Remote call; must throw on failure (resource clients do). */
  request: () => Promise<T>;
  /** Reconciles local state with the authoritative server response. */
  commit?: (result: T) => void;
  successMessage?: SuccessMessage<T>;
  successType?: ToastItem['type'];
}

/** Creates: wait for the server, then insert the entity it returns. */
export type PessimisticMutation<T> = MutationRequest<T>;

/** Updates/deletes: apply locally first and restore the captured state on failure. */
export interface OptimisticMutation<T, S> extends MutationRequest<T> {
  /** Returns the live state to restore on failure; it is deep-cloned before `apply`. */
  capture: () => S;
  apply: () => void;
  rollback: (previous: S) => void;
}

const inFlightCount = ref(0);
const successListeners = new Set<() => void>();

/**
 * Deep copy of store state through `structuredClone`. Vue stores raw values inside
 * reactive collections, so unwrapping the first level is enough to also support
 * snapshot containers assembled in `capture` (e.g. `{ program, unit }`).
 */
export function cloneState<T>(value: T): T {
  const raw: unknown = toRaw(value);
  const detached = Array.isArray(raw)
    ? raw.map((item: unknown) => toRaw(item))
    : raw !== null && typeof raw === 'object'
      ? Object.fromEntries(Object.entries(raw).map(([key, item]) => [key, toRaw(item)]))
      : raw;
  return structuredClone(detached) as T;
}

/** Subscribes to every successful mutation (e.g. to refresh server-side audit logs). */
export function onMutationSucceeded(listener: () => void): () => void {
  successListeners.add(listener);
  return () => successListeners.delete(listener);
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  const message = error instanceof Error ? error.message : 'Error inesperado en la aplicación';
  return new ApiError(0, 'UNEXPECTED_ERROR', message, '');
}

export function useMutation() {
  const { showToast } = useToast();

  async function execute<T>(mutation: MutationRequest<T>): Promise<MutationResult<T>> {
    inFlightCount.value += 1;
    try {
      const data = await mutation.request();
      mutation.commit?.(data);
      successListeners.forEach((listener) => listener());
      if (mutation.successMessage) {
        const { successMessage } = mutation;
        showToast(
          typeof successMessage === 'function' ? successMessage(data) : successMessage,
          mutation.successType,
        );
      }
      return { ok: true, data };
    } catch (error) {
      const apiError = toApiError(error);
      showToast(apiError.message, 'error');
      return { ok: false, error: apiError };
    } finally {
      inFlightCount.value -= 1;
    }
  }

  function runPessimistic<T>(mutation: PessimisticMutation<T>): Promise<MutationResult<T>> {
    return execute(mutation);
  }

  async function runOptimistic<T, S>(
    mutation: OptimisticMutation<T, S>,
  ): Promise<MutationResult<T>> {
    const previous = cloneState(mutation.capture());
    mutation.apply();
    const result = await execute(mutation);
    if (!result.ok) mutation.rollback(previous);
    return result;
  }

  /** Fails a mutation before reaching the server (client-side UX pre-checks). */
  function reject<T>(code: ApiErrorCode, message: string): Promise<MutationResult<T>> {
    showToast(message, 'error');
    return Promise.resolve({ ok: false, error: new ApiError(0, code, message, '') });
  }

  return {
    runOptimistic,
    runPessimistic,
    reject,
    isMutating: computed(() => inFlightCount.value > 0),
  };
}
