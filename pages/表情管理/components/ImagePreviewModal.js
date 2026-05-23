// 图片预览弹窗组件
export const ImagePreviewModal = {
    props: {
        previewOpen: Boolean,
        previewItem: Object,
        isEditing: Boolean,
        editForm: Object,
        availableEmotions: Array,
        imageDataUrls: Object,
        PLACEHOLDER: String,
    },
    emits: [
        'close', 'prevImage', 'nextImage', 'startEdit', 'cancelEdit', 'saveEdit',
        'download', 'delete', 'toggleScope', 'formatOriginTarget', 'formatDate'
    ],
    computed: {
        currentImageUrl() {
            return this.imageDataUrls[this.previewItem?.hash] || this.PLACEHOLDER;
        },
    },
    template: `
        <div v-if="previewOpen" class="modal-overlay" @click.self="$emit('close')">
            <div class="modal-panel">
                <div class="modal-panel-corner-bl"></div>
                <div class="modal-panel-corner-br"></div>

                <div class="modal-header">
                    <h2>{{ isEditing ? '编辑' : '详情' }}</h2>
                    <button @click="$emit('close')" class="modal-close">
                        <svg style="width:20px;height:20px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <div class="modal-content">
                    <!-- 查看模式 -->
                    <div v-if="!isEditing" class="item-detail">
                        <div class="item-preview">
                            <button
                                v-if="images.length > 1"
                                @click.stop="$emit('prevImage')"
                                class="nav-btn left"
                            >
                                <svg style="width:24px;height:24px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                                </svg>
                            </button>

                            <img :src="currentImageUrl" :alt="previewItem?.desc">

                            <button
                                v-if="images.length > 1"
                                @click.stop="$emit('nextImage')"
                                class="nav-btn right"
                            >
                                <svg style="width:24px;height:24px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                </svg>
                            </button>
                        </div>

                        <div class="item-stats">
                            <div class="stat-row">
                                <span class="stat-name">分类</span>
                                <span class="stat-value">{{ previewItem?.category }}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-name">作用域</span>
                                <span class="stat-value">
                                    <span class="scope-pill" :class="previewItem?.scope_mode === 'local' ? 'local' : 'public'">
                                        {{ previewItem?.scope_mode === 'local' ? '本群限定' : '公共' }}
                                    </span>
                                </span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-name">来源</span>
                                <span class="stat-value">{{ $emit('formatOriginTarget', previewItem?.origin_target) }}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-name">描述</span>
                            </div>
                            <div style="padding:12px;background:rgba(0,0,0,0.3);margin-bottom:12px;border-left:3px solid var(--gold-dim)">
                                <p style="margin:0;color:var(--text-main);font-style:italic">
                                    {{ previewItem?.desc || '暂无描述' }}
                                </p>
                            </div>
                            <div class="stat-row">
                                <span class="stat-name">标签</span>
                            </div>
                            <div class="item-tags" style="margin-bottom:12px">
                                <span v-for="tag in (previewItem?.tags || [])" :key="tag" class="tag">
                                    {{ tag }}
                                </span>
                                <span v-if="!(previewItem?.tags || []).length" style="font-size:0.85rem;color:var(--text-muted)">无标签</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-name">场景</span>
                            </div>
                            <div class="item-tags" style="margin-bottom:12px">
                                <span v-for="scene in (previewItem?.scenes || [])" :key="scene" class="tag scene-tag">
                                    {{ scene }}
                                </span>
                                <span v-if="!(previewItem?.scenes || []).length" style="font-size:0.85rem;color:var(--text-muted)">无场景</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-name">添加时间</span>
                                <span class="stat-value">{{ $emit('formatDate', previewItem?.created_at) }}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-name">ID</span>
                                <span class="stat-value" style="font-size:0.75rem;word-break:break-all">{{ previewItem?.hash?.slice(0, 16) }}...</span>
                            </div>
                        </div>
                    </div>

                    <!-- 编辑模式 -->
                    <div v-else style="padding:24px;width:100%">
                        <div style="max-width:500px;margin:0 auto">
                            <div style="margin-bottom:20px">
                                <label style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-muted);display:block;margin-bottom:8px">分类</label>
                                <select v-model="editForm.category" class="codex-input">
                                    <option v-for="cat in availableEmotions" :key="cat.key" :value="cat.key">{{ cat.name }}</option>
                                </select>
                            </div>

                            <div style="margin-bottom:20px">
                                <label style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-muted);display:block;margin-bottom:8px">作用域</label>
                                <select v-model="editForm.scope_mode" class="codex-input">
                                    <option value="public">public / 公共</option>
                                    <option value="local">local / 本群限定</option>
                                </select>
                            </div>

                            <div style="margin-bottom:20px">
                                <label style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-muted);display:block;margin-bottom:8px">描述</label>
                                <textarea v-model="editForm.desc" class="codex-input" rows="3"></textarea>
                            </div>

                            <div style="margin-bottom:20px">
                                <label style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-muted);display:block;margin-bottom:8px">场景 (顿号/逗号分隔)</label>
                                <input v-model="editForm.scene" type="text" class="codex-input" placeholder="例如: 庆祝、表达开心">
                            </div>

                            <div style="margin-bottom:20px">
                                <label style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-muted);display:block;margin-bottom:8px">标签 (逗号分隔)</label>
                                <input v-model="editForm.tags" type="text" class="codex-input" placeholder="例如: 可爱, 搞怪, 稀有">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-actions">
                    <template v-if="!isEditing">
                        <a href="#" @click.prevent="$emit('download', previewItem)" class="codex-btn" style="flex:1">
                            <svg style="width:16px;height:16px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                            </svg>
                            下载
                        </a>
                        <button @click="$emit('startEdit')" class="codex-btn" style="flex:1">
                            <svg style="width:16px;height:16px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                            </svg>
                            编辑
                        </button>
                        <button @click="$emit('toggleScope', previewItem, previewItem?.scope_mode === 'local' ? 'public' : 'local')" class="codex-btn" style="flex:1">
                            {{ previewItem?.scope_mode === 'local' ? '解除限定' : '限定本群' }}
                        </button>
                        <button @click="$emit('delete', previewItem)" class="codex-btn danger" style="flex:1">
                            <svg style="width:16px;height:16px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                            删除
                        </button>
                        <button @click="$emit('delete', previewItem, true)" class="codex-btn danger" style="flex:1" title="删除并加入黑名单">
                            <svg style="width:16px;height:16px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                            </svg>
                            拉黑
                        </button>
                    </template>
                    <template v-else>
                        <button @click="$emit('cancelEdit')" class="codex-btn" style="flex:1">取消</button>
                        <button @click="$emit('saveEdit')" class="codex-btn primary" style="flex:1">保存</button>
                    </template>
                </div>
            </div>
        </div>
    `,
};