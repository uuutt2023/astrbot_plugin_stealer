// 上传弹窗组件
export const UploadModal = {
    props: {
        uploadOpen: Boolean,
        uploading: Boolean,
        uploadFile: Object,
        uploadPreviewUrl: String,
        uploadError: String,
        uploadForm: Object,
        availableEmotions: Array,
        analysisScenes: Array,
        analyzing: Boolean,
    },
    emits: [
        'close', 'fileSelect', 'analyzeImage', 'toggleScene', 'isSceneSelected', 'submitUpload'
    ],
    template: `
        <div v-if="uploadOpen" class="modal-overlay" @click.self="$emit('close')">
            <div class="modal-panel" style="max-width:600px">
                <div class="modal-panel-corner-bl"></div>
                <div class="modal-panel-corner-br"></div>

                <div class="modal-header">
                    <h2>添加表情包</h2>
                    <button @click="$emit('close')" class="modal-close">
                        <svg style="width:20px;height:20px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <form @submit.prevent="$emit('submitUpload')" style="padding:24px">
                    <div class="upload-area" @click="$refs.fileInput.click()">
                        <input
                            ref="fileInput"
                            type="file"
                            accept="image/*"
                            @change="$emit('fileSelect', $event)"
                            style="display:none"
                        >

                        <div v-if="uploadPreviewUrl" class="upload-preview-row">
                            <img :src="uploadPreviewUrl" class="upload-preview">
                            <div class="upload-preview-info">
                                <p class="upload-preview-name">{{ uploadFile?.name }}</p>
                                <p class="upload-preview-size">{{ (uploadFile?.size / 1024).toFixed(1) }} KB</p>
                            </div>
                        </div>

                        <div v-else>
                            <svg style="width:48px;height:48px;margin:0 auto 16px auto;color:var(--gold-dim);opacity:0.5;display:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            <p style="margin:0;color:var(--text-muted);font-family:'Cinzel',serif;text-align:center">点击上传图片</p>
                        </div>
                    </div>

                    <div style="margin-top:20px">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                            <label style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-muted)">分类 *</label>
                            <button
                                v-if="uploadFile"
                                type="button"
                                @click.prevent="$emit('analyzeImage')"
                                :disabled="analyzing || !uploadFile"
                                class="codex-btn"
                                style="font-size:0.7rem;padding:6px 12px;min-height:auto"
                            >
                                <svg v-if="!analyzing" style="width:14px;height:14px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                </svg>
                                <svg v-else style="width:14px;height:14px;animation:spin 1s linear infinite" fill="none" viewBox="0 0 24 24">
                                    <circle style="opacity:0.25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path style="opacity:0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span v-if="analyzing">分析中...</span>
                                <span v-else>自动识别</span>
                            </button>
                        </div>
                        <select v-model="uploadForm.emotion" class="codex-input" required>
                            <option value="">请选择分类...</option>
                            <option v-for="emo in availableEmotions" :key="emo.key" :value="emo.key">{{ emo.name || emo.key }}</option>
                        </select>
                    </div>

                    <div v-if="analysisScenes.length" class="analysis-result" style="margin-top:16px">
                        <div class="analysis-result-head">
                            <div class="analysis-result-title">识别到的场景</div>
                            <div class="analysis-result-subtitle">点击标签可添加/移除到"场景"输入框</div>
                        </div>
                        <div class="item-tags" style="margin-top:10px">
                            <button
                                v-for="scene in analysisScenes"
                                :key="scene"
                                type="button"
                                class="tag scene-tag scene-tag-btn"
                                :class="{ active: $emit('isSceneSelected', scene) }"
                                @click="$emit('toggleScene', scene)"
                            >
                                {{ scene }}
                            </button>
                        </div>
                    </div>

                    <div style="margin-top:16px">
                        <label style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-muted);display:block;margin-bottom:8px">场景</label>
                        <input v-model="uploadForm.scene" type="text" class="codex-input" placeholder="例如: 办公室、聊天窗口、深夜">
                        <p style="margin:8px 0 0;font-size:0.8rem;color:var(--text-muted)">支持使用中文顿号、逗号或分号分隔。</p>
                    </div>

                    <div style="margin-top:16px">
                        <label style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-muted);display:block;margin-bottom:8px">标签</label>
                        <input v-model="uploadForm.tags" type="text" class="codex-input" placeholder="例如: 可爱, 搞怪">
                    </div>

                    <div style="margin-top:16px">
                        <label style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-muted);display:block;margin-bottom:8px">描述</label>
                        <textarea v-model="uploadForm.desc" class="codex-input" rows="2" placeholder="关于此表情包的描述..."></textarea>
                    </div>

                    <div v-if="uploadError" style="color:#ef4444;font-size:0.875rem;border:1px solid rgba(239,68,68,0.3);background:rgba(239,68,68,0.1);padding:12px;margin-top:16px">
                        {{ uploadError }}
                    </div>

                    <div class="modal-footer-actions">
                        <button type="button" @click="$emit('close')" class="codex-btn" style="flex:1">取消</button>
                        <button type="submit" :disabled="uploading || !uploadFile" class="codex-btn primary" style="flex:1">
                            <span v-if="uploading">上传中...</span>
                            <span v-else>确认添加</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `,
};