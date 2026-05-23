<script setup>
/**
 * @description 根组件 - 路由入口和登录状态控制
 */
import { computed } from 'vue';
import { useCookie } from 'vue-cookie-next';

import { useAppStore } from '@/stores/appStore.js';

const appStore = useAppStore();
const $cookie = useCookie();

// 检查登录状态
const isLoggedIn = computed(() => appStore.loginState === 'loggedIn');
const showLogin = computed(() => appStore.loginState !== 'loggedIn');

// 处理登录提交
const handleLoginSubmit = () => {
  appStore.handleLoginSubmit();
  if (appStore.bridge) {
    setTimeout(() => {
      appStore.initTheme();
    }, 800);
  }
};
</script>

<template>
  <LoginPage
    v-if="showLogin"
    :loginState="appStore.loginState"
    :loginError="appStore.loginError"
    @submit="handleLoginSubmit"
  />
  <router-view v-else />
</template>
