// 分类管理弹窗组件
export const EmotionModal = {
    props: {
        emotionsOpen: Boolean,
        availableEmotions: Array,
        newEmotion: Object,
        addingEmotion: Boolean,
        deletingEmotionKey: String,
    },
    emits: ['close', 'addEmotion', 'deleteEmotionByKey'],
    template: `
        <div v-if="emotionsOpen" class="modal-overlay" @click.self="$emit('close')">
            <div class="modal-panel" style="max-width:650px">
                <div class="modal-panel-corner-bl"></div>
                <div class="modal-panel-corner-br"></div>

                <div class="modal-header">
                    <h2>分类管理</h2>
                    <button @click="$emit('close')" class="modal-close">
                        <svg style="width:20px;height:20px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <div style="padding:24px;max-height:70vh;overflow-y:auto">
                    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin-bottom:24px">
                        <div
                            v-for="emo in availableEmotions"
                            :key="emo.key"
                            style="background:var(--bg-slot);border:1px solid var(--gold-dark);padding:16px;position:relative"
                        >
                            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
                                <span style="font-size:0.9rem;font-weight:600;color:var(--gold-primary)">{{ emo.name || emo.key }}</span>
                                <span style="font-size:0.75rem;color:var(--text-muted);font-family:'Cinzel',serif">{{ emo.count || 0 }}张</span>
                            </div>
                            <p style="margin:0;font-size:0.8rem;color:var(--text-muted)">{{ emo.desc || '暂无描述' }}</p>
                            <button
                                v-if="deletingEmotionKey !== emo.key"
                                @click="$emit('deleteEmotionByKey', emo)"
                                style="position:absolute;top:8px;right:8px;background:transparent;border:none;color:var(--text-muted);cursor:pointer;padding:4px;opacity:0.6;transition:opacity 0.2s"
                                title="删除分类"
                            >
                                <svg style="width:16px;height:16px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                            <div v-else-if="deletingEmotionKey === emo.key" style="position:absolute;top:8px;right:8px;color:var(--gold-primary)">
                                <svg style="width:16px;height:16px;animation:spin 1s linear infinite" fill="none" viewBox="0 0 24 24">
                                    <circle style="opacity:0.25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path style="opacity:0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        </div>

                        <div v-if="availableEmotions.length === 0" style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted)">
                            暂无分类，点击下方添加
                        </div>
                    </div>

                    <div style="border-top:1px solid var(--gold-dark);padding-top:24px">
                        <h3 style="margin:0 0 16px;font-size:1rem;color:var(--gold-primary)">添加新分类</h3>

                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
                            <div>
                                <label style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-muted);display:block;margin-bottom:8px">标识 *</label>
                                <input
                                    v-model="newEmotion.key"
                                    type="text"
                                    class="codex-input"
                                    placeholder="例如: happy"
                                >
                            </div>
                            <div>
                                <label style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-muted);display:block;margin-bottom:8px">名称</label>
                                <input
                                    v-model="newEmotion.name"
                                    type="text"
                                    class="codex-input"
                                    placeholder="例如: 开心"
                                >
                            </div>
                        </div>

                        <div style="margin-bottom:12px">
                            <label style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-muted);display:block;margin-bottom:8px">描述</label>
                            <input
                                v-model="newEmotion.desc"
                                type="text"
                                class="codex-input"
                                placeholder="分类描述（可选）"
                            >
                        </div>

                        <button
                            @click="$emit('addEmotion')"
                            :disabled="addingEmotion || !newEmotion.key"
                            class="codex-btn primary"
                        >
                            <span v-if="addingEmotion">添加中...</span>
                            <span v-else>添加分类</span>
                        </button>
                    </div>
                </div>

                <div style="padding:16px 24px;background:var(--bg-panel);border-top:1px solid var(--gold-dark)">
                    <button @click="$emit('close')" class="codex-btn" style="width:100%">关闭</button>
                </div>
            </div>
        </div>
    `,
};