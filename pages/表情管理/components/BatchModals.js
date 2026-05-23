// 批量移动弹窗组件
export const BatchMoveModal = {
    props: {
        batchMoveOpen: Boolean,
        batchTargetCategory: String,
        availableEmotions: Array,
        selectedCount: Number,
    },
    emits: ['close', 'update:batchTargetCategory', 'confirm'],
    template: `
        <div v-if="batchMoveOpen" class="modal-overlay" @click.self="$emit('close')">
            <div class="modal-panel" style="max-width:450px">
                <div class="modal-header">
                    <h2>批量移动到分类</h2>
                    <button @click="$emit('close')" class="modal-close">
                        <svg style="width:20px;height:20px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <div style="padding:24px">
                    <p style="margin:0 0 20px;color:var(--text-main)">
                        已选择 <strong style="color:var(--gold-primary)">{{ selectedCount }}</strong> 张图片，移动到：
                    </p>

                    <select
                        :value="batchTargetCategory"
                        @input="$emit('update:batchTargetCategory', $event.target.value)"
                        class="codex-input"
                    >
                        <option value="">请选择目标分类...</option>
                        <option v-for="emo in availableEmotions" :key="emo.key" :value="emo.key">{{ emo.name || emo.key }}</option>
                    </select>

                    <div style="display:flex;gap:12px;margin-top:24px">
                        <button @click="$emit('close')" class="codex-btn" style="flex:1">取消</button>
                        <button
                            @click="$emit('confirm')"
                            :disabled="!batchTargetCategory"
                            class="codex-btn primary"
                            style="flex:1"
                        >
                            确认移动
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,
};

// 批量作用域弹窗组件
export const BatchScopeModal = {
    props: {
        batchScopeOpen: Boolean,
        batchScopeMode: String,
        selectedCount: Number,
    },
    emits: ['close', 'update:batchScopeMode', 'confirm'],
    template: `
        <div v-if="batchScopeOpen" class="modal-overlay" @click.self="$emit('close')">
            <div class="modal-panel" style="max-width:450px">
                <div class="modal-header">
                    <h2>批量设置作用域</h2>
                    <button @click="$emit('close')" class="modal-close">
                        <svg style="width:20px;height:20px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <div style="padding:24px">
                    <p style="margin:0 0 20px;color:var(--text-main)">
                        已选择 <strong style="color:var(--gold-primary)">{{ selectedCount }}</strong> 张图片，设置作用域为：
                    </p>

                    <select
                        :value="batchScopeMode"
                        @input="$emit('update:batchScopeMode', $event.target.value)"
                        class="codex-input"
                    >
                        <option value="public">public / 公共</option>
                        <option value="local">local / 本群限定</option>
                    </select>

                    <p style="margin:12px 0 0;font-size:0.8rem;color:var(--gold-dim)">
                        注意：设置为 local 的图片需要有有效的来源群信息，否则会被跳过。
                    </p>

                    <div style="display:flex;gap:12px;margin-top:24px">
                        <button @click="$emit('close')" class="codex-btn" style="flex:1">取消</button>
                        <button
                            @click="$emit('confirm')"
                            class="codex-btn primary"
                            style="flex:1"
                        >
                            确认设置
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,
};