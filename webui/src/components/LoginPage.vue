<script setup>
import { ref } from 'vue';

const showPassword = ref(false);

defineProps({
  loginState: String,
  loginError: String,
  apiKey: String,
});

const emit = defineEmits(['submit', 'togglePassword']);
</script>

<template>
  <div class="login-overlay">
    <div class="login-bg-decoration">
      <div class="floating-icon icon-1">
        <IconShield />
      </div>
    </div>

    <div class="login-panel">
      <!-- Loading -->
      <div v-if="loginState === 'loading'" class="login-loading">
        <div class="login-spinner">
          <div class="login-spinner-ring"></div>
        </div>
        <p class="login-loading-text">正在验证身份...</p>
      </div>

      <!-- Success -->
      <div v-else-if="loginState === 'success'" class="login-success">
        <div class="login-success-icon">
          <IconCheck />
        </div>
        <p class="login-success-text">登录成功</p>
      </div>

      <!-- Form -->
      <template v-else>
        <div class="login-logo">
          <div class="login-logo-icon">
            <IconPackage />
          </div>
          <h1 class="login-title">表情包管理</h1>
          <p class="login-subtitle">登录以继续</p>
        </div>

        <form class="login-form" @submit.prevent="$emit('submit')">
          <div v-if="loginError" class="login-error">{{ loginError }}</div>
          <button type="submit" class="login-submit-btn">进入</button>
        </form>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
};
</script>
