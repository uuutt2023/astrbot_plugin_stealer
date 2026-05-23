<script setup>
defineProps({
  toastOpen: Boolean,
  toastMessage: String,
});

const emit = defineEmits(['close']);
</script>

<template>
  <Transition name="fade">
    <div v-if="toastOpen" class="toast-notification">
      {{ toastMessage }}
    </div>
  </Transition>
</template>

<script>
export default {
  name: 'ToastNotification',
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
