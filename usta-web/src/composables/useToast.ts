import { ref } from 'vue';

export interface ToastItem {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error';
}

const toasts = ref<ToastItem[]>([]);

/** Module-scoped toast notification queue shared across Pinia stores and Vue components. */
export function useToast() {
  function showToast(
    message: string,
    type: 'info' | 'success' | 'error' = 'success',
    durationMs = 3800,
  ): void {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    toasts.value.push({ id, message, type });
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id);
    }, durationMs);
  }

  function dismissToast(id: number): void {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  function clearToasts(): void {
    toasts.value = [];
  }

  return {
    toasts,
    showToast,
    dismissToast,
    clearToasts,
  };
}
