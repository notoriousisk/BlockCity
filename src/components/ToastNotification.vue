<template>
  <Transition name="toast">
    <div
      v-if="activeToast"
      :class="[
        'toast',
        `toast--${activeToast.type}`,
        `toast--${activeToast.variant || 'default'}`,
      ]"
      @click="removeFirstFromQueue"
    >
      <div class="toast__content">
        <h3 class="toast__title">{{ activeToast.title }}</h3>
        <p v-if="activeToast.content" class="toast__message">
          {{ activeToast.content }}
        </p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useToastStore } from "@/stores/toast";
import { storeToRefs } from "pinia";
import { watch } from "vue";

const toastStore = useToastStore();
const { activeToast } = storeToRefs(toastStore);
const { removeFirstFromQueue } = toastStore;

// Auto dismiss after 3 seconds
watch(activeToast, (newToast) => {
  if (newToast) {
    const timer = setTimeout(() => {
      removeFirstFromQueue();
    }, 3000);

    // Cleanup timer when component is unmounted or toast changes
    return () => clearTimeout(timer);
  }
});
</script>

<style scoped>
.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 16px 24px;
  border-radius: 20px;
  background: var(--color-surface);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  z-index: 9999;
  transform-origin: top center;
  border: 3px solid transparent;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.toast--default {
  width: 80%;
  max-width: 800px;
}

.toast--compact {
  width: auto;
  min-width: 200px;
  max-width: 400px;
}

.toast:hover {
  transform: translateX(-50%) scale(1.02);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2);
}

.toast--success {
  background: var(--color-success);
  border-color: var(--color-success);
}

.toast--error {
  background: var(--color-error);
  border-color: var(--color-error);
}

.toast--warning {
  background: var(--color-warning);
  border-color: var(--color-warning);
}

.toast__content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: center;
}

.toast--compact .toast__content {
  gap: 4px;
}

.toast__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-light);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toast--compact .toast__title {
  font-size: 16px;
}

.toast__message {
  margin: 0;
  font-size: 15px;
  color: var(--color-light);
  opacity: 0.9;
  line-height: 1.4;
}

.toast--compact .toast__message {
  font-size: 14px;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.toast-enter-from {
  transform: translate(-50%, -100%) scale(0.95);
  opacity: 0;
}

.toast-leave-to {
  transform: translate(-50%, -100%) scale(0.95);
  opacity: 0;
}
</style>
