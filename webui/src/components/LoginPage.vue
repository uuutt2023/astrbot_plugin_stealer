<script setup>
import { ref } from 'vue'

const showPassword = ref(false)

defineProps({
    loginState: String,
    loginError: String,
    apiKey: String
})

const emit = defineEmits(['submit', 'togglePassword'])
</script>

<template>
    <div class="login-overlay">
        <div class="login-bg-decoration">
            <div class="floating-icon icon-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
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
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                </div>
                <p class="login-success-text">登录成功</p>
            </div>

            <!-- Form -->
            <template v-else>
                <div class="login-logo">
                    <div class="login-logo-icon">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                        </svg>
                    </div>
                    <h1 class="login-title">表情包管理</h1>
                    <p class="login-subtitle">登录以继续</p>
                </div>

                <form @submit.prevent="$emit('submit')" class="login-form">
                    <div v-if="loginError" class="login-error">{{ loginError }}</div>
                    <button type="submit" class="login-submit-btn">进入</button>
                </form>
            </template>
        </div>
    </div>
</template>

<script>
export default {
    name: 'LoginPage'
}
</script>