// Toast 通知组件
export const ToastNotification = {
    props: {
        toastOpen: Boolean,
        toastMessage: String,
    },
    emits: ['close'],
    template: `
        <div v-if="toastOpen" class="toast-notification" @click="$emit('close')">
            {{ toastMessage }}
        </div>
    `,
};

// 确认对话框组件
export const ConfirmDialog = {
    props: {
        confirmOpen: Boolean,
        confirmMessage: String,
    },
    emits: ['yes', 'no'],
    template: `
        <div v-if="confirmOpen" class="modal-overlay" @click.self="$emit('no')">
            <div class="modal-panel" style="max-width:400px">
                <div class="modal-header">
                    <h2>确认操作</h2>
                </div>
                <div style="padding:24px">
                    <p style="margin:0 0 24px;color:var(--text-main);font-size:1rem">{{ confirmMessage }}</p>
                    <div style="display:flex;gap:12px">
                        <button @click="$emit('no')" class="codex-btn" style="flex:1">取消</button>
                        <button @click="$emit('yes')" class="codex-btn danger" style="flex:1">确认</button>
                    </div>
                </div>
            </div>
        </div>
    `,
};