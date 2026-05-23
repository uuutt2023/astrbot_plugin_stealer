<script setup>
/**
 * @description 根组件 - 路由入口和登录状态控制
 */
import { computed, onMounted } from 'vue';
import { useCookie } from 'vue-cookie-next';

import { useAppStore } from '@/stores/appStore.js';

const appStore = useAppStore();
const $cookie = useCookie();

// 初始化桥接（在根组件挂载时执行）
onMounted(() => {
  const bridge = window.AstrBotPluginPage;
  appStore.initBridge(bridge);
  if (bridge) {
    appStore.setLoginState('form', '');
  } else {
    appStore.setLoginState('error', '未检测到 AstrBot 桥接环境');
  }
});

// 检查登录状态
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
