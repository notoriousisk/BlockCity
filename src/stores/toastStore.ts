import { defineStore } from "pinia";
import { ref } from "vue";
import type { ToastProps } from "@/types";

export interface ToastData extends ToastProps {
  id: string;
}

export const useToastStore = defineStore("toast", () => {
  const queue = ref<ToastProps[]>([]);
  const activeToast = ref<ToastData | null>(null);

  const setActive = (toast: ToastProps): void => {
    activeToast.value = {
      ...toast,
      type: toast.type ?? "error",
      id: performance.now().toString(),
    };
  };

  const addToQueue = (toast: ToastProps): void => {
    if (toast.title === activeToast.value?.title) return;
    queue.value.push(toast);
    setActive(toast);
  };

  const removeFirstFromQueue = (): void => {
    queue.value.shift();
    if (queue.value.length) {
      setActive(queue.value[0]);
    } else {
      activeToast.value = null;
    }
  };

  const clearQueue = (): void => {
    queue.value = [];
  };

  return { queue, activeToast, addToQueue, removeFirstFromQueue, clearQueue };
});

export function openToast(props: ToastProps) {
  useToastStore().addToQueue(props);
}

export function removeFirstFromQueue() {
  useToastStore().removeFirstFromQueue();
}
