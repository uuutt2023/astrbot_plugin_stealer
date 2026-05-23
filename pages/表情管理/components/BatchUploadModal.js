// 批量上传弹窗组件
export const BatchUploadModal = {
    props: {
        batchUploadOpen: Boolean,
        batchUploading: Boolean,
        batchFiles: Array,
        batchPreviews: Array,
        batchUploadError: String,
        batchUploadForm: Object,
        batchTaskId: String,
        batchTaskStatus: String,
        batchTaskTotal: Number,
        batchTaskProcessed: Number,
        batchTaskSuccess: Number,
        batchTaskFailed: Number,
        availableEmotions: Array,
    },
    emits: [
        'close', 'fileSelect', 'clearFiles', 'submitUpload', 'reset'
    ],
    methods: {
        formatBatchSize() {
            const totalSize = this.batchFiles.reduce((sum, f) => sum + f.size, 0);
            if (totalSize < 1024) return totalSize + ' B';
            if (totalSize < 1024 * 1024) return (totalSize / 1024).toFixed(1) + ' KB';
            return (totalSize / (1024 * 1024)).toFixed(1) + ' MB';
        },
    },
    template: `
        <div v-if="batchUploadOpen" class="modal-overlay" @click.self="$emit('close')">
            <div class="modal-panel" style="max-width:700px">
                <div class="modal-panel-corner-bl"></div>
                <div class="modal-panel-corner-br"></div>

                <div class="modal-header">
                    <h2>批量导入表情包</h2>
                    <button @click="$emit('close')" class="modal-close">
                        <svg style="width:20px;height:20px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <form @submit.prevent="$emit('submitUpload')" style="padding:24px">
                    <div v-if="!batchTaskId">
                        <div class="upload-area" @click="$refs.batchFileInput.click()" style="min-height:150px">
                            <input
                                ref="batchFileInput"
                                type="file"
                                accept="image/*"
                                multiple
                                @change="$emit('fileSelect', $event)"
                                style="display:none"
                            >

                            <div v-if="batchFiles.length">
                                <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
                                    <svg style="width:32px;height:32px;color:var(--gold-primary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                    </svg>
                                    <div>
                                        <p style="margin:0 0 4px 0;color:var(--gold-primary);font-family:'Cinzel',serif">已选择 {{ batchFiles.length }} 张图片</p>
                                        <p style="margin:0;color:var(--text-muted);font-size:0.85rem">{{ formatBatchSize() }}</p>
                                    </div>
                                </div>
                                <div class="batch-file-list">
                                    <div v-for="(file, idx) in batchFiles.slice(0, 8)" :key="idx" class="batch-file-item">
                                        <img v-if="batchPreviews[idx]" :src="batchPreviews[idx]" class="batch-file-thumb">
                                        <span class="batch-file-name">{{ file.name }}</span>
                                    </div>
                                    <div v-if="batchFiles.length > 8" class="batch-file-more">
                                        还有 {{ batchFiles.length - 8 }} 张...
                                    </div>
                                </div>
                                <button type="button" @click.stop="$emit('clearFiles')" class="codex-btn" style="margin-top:12px;font-size:0.8rem;padding:6px 12px">
                                    清除选择
                                </button>
                            </div>

                            <div v-else>
                                <svg style="width:48px;height:48px;margin:0 auto 16px auto;color:var(--gold-dim);opacity:0.5;display:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>
                                <p style="margin:0;color:var(--text-muted);font-family:'Cinzel',serif;text-align:center">点击或拖拽上传多张图片</p>
                                <p style="margin:8px 0 0;color:var(--text-muted);font-size:0.85rem;text-align:center">支持 PNG, JPG, GIF, WEBP, BMP</p>
                            </div>
                        </div>

                        <div style="margin-top:20px">
                            <label style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-muted);display:block;margin-bottom:8px">默认分类 *</label>
                            <select v-model="batchUploadForm.emotion" class="codex-input" :disabled="batchUploadForm.autoAnalyze" required>
                                <option value="">请选择分类...</option>
                                <option v-for="emo in availableEmotions" :key="emo.key" :value="emo.key">{{ emo.name || emo.key }}</option>
                            </select>
                            <p style="margin:8px 0 0;font-size:0.8rem;color:var(--text-muted)">图片会保存到此分类（自动分析时无需选择）</p>
                        </div>

                        <div style="margin-top:16px">
                            <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
                                <input type="checkbox" v-model="batchUploadForm.autoAnalyze" class="codex-checkbox" :disabled="batchUploadForm.emotion !== ''">
                                <span style="font-size:0.85rem;color:var(--text-main)">自动识别（使用AI分析每张图片并自动分类）</span>
                            </label>
                            <p v-if="batchUploadForm.emotion !== ''" style="margin:4px 0 0 24px;font-size:0.75rem;color:var(--gold-dim)">请先取消分类选择才能启用自动识别</p>
                            <p v-if="batchUploadForm.autoAnalyze" style="margin:8px 0 0 24px;font-size:0.75rem;color:#f59e0b;padding:8px;background:rgba(245,158,11,0.1);border-radius:4px">⚠️ 自动分析会高并发调用VLM，请确认API支持并发或分批次分析</p>
                        </div>

                        <div v-if="batchUploadError" style="color:#ef4444;font-size:0.875rem;border:1px solid rgba(239,68,68,0.3);background:rgba(239,68,68,0.1);padding:12px;margin-top:16px">
                            {{ batchUploadError }}
                        </div>

                        <div class="modal-footer-actions">
                            <button type="button" @click="$emit('close')" class="codex-btn" style="flex:1">取消</button>
                            <button type="submit" :disabled="batchUploading || batchFiles.length === 0" class="codex-btn primary" style="flex:1">
                                <span v-if="batchUploading">上传中...</span>
                                <span v-else>开始导入 ({{ batchFiles.length }}张)</span>
                            </button>
                        </div>
                    </div>

                    <div v-else style="padding:24px">
                        <div style="text-align:center;margin-bottom:24px">
                            <div v-if="batchTaskStatus === 'processing'" class="batch-spinner">
                                <svg style="width:48px;height:48px;animation:spin 1s linear infinite;color:var(--gold-primary)" fill="none" viewBox="0 0 24 24">
                                    <circle style="opacity:0.25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path style="opacity:0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                            <div v-else-if="batchTaskStatus === 'completed'" style="color:#22c55e">
                                <svg style="width:48px;height:48px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                </svg>
                            </div>
                            <div v-else-if="batchTaskStatus === 'failed'" style="color:#ef4444">
                                <svg style="width:48px;height:48px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </div>

                            <h3 style="margin:16px 0 8px;font-size:1.2rem;color:var(--text-main)">
                                <span v-if="batchTaskStatus === 'processing'">正在处理...</span>
                                <span v-else-if="batchTaskStatus === 'completed'">导入完成</span>
                                <span v-else-if="batchTaskStatus === 'failed'">导入失败</span>
                            </h3>

                            <p style="margin:0;color:var(--text-muted);font-size:0.9rem">
                                {{ batchTaskProcessed }} / {{ batchTaskTotal }}
                                <span v-if="batchTaskSuccess > 0" style="color:#22c55e"> ({{ batchTaskSuccess }} 成功)</span>
                                <span v-if="batchTaskFailed > 0" style="color:#ef4444"> ({{ batchTaskFailed }} 失败)</span>
                            </p>
                        </div>

                        <div v-if="batchTaskStatus === 'processing'" style="margin-bottom:16px">
                            <div class="progress-bar">
                                <div class="progress-fill" :style="{ width: (batchTaskProcessed / batchTaskTotal * 100) + '%' }"></div>
                            </div>
                        </div>

                        <div v-if="batchUploadError && batchTaskStatus === 'failed'" style="color:#ef4444;font-size:0.875rem;text-align:center;margin-bottom:16px">
                            {{ batchUploadError }}
                        </div>

                        <div v-if="batchTaskStatus === 'completed'" style="display:flex;gap:12px">
                            <button type="button" @click="$emit('reset')" class="codex-btn" style="flex:1">继续导入</button>
                            <button type="button" @click="$emit('close')" class="codex-btn primary" style="flex:1">完成</button>
                        </div>
                        <div v-else-if="batchTaskStatus === 'failed'" style="display:flex;gap:12px">
                            <button type="button" @click="$emit('reset')" class="codex-btn" style="flex:1">重试</button>
                            <button type="button" @click="$emit('close')" class="codex-btn" style="flex:1">关闭</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `,
};