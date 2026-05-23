// 图片网格组件
export const ImageGrid = {
    props: {
        images: Array,
        imageDataUrls: Object,
        isBatchMode: Boolean,
        selectedImages: Set,
        PLACEHOLDER: String,
    },
    emits: ['select', 'preview'],
    template: `
        <div class="inventory-grid">
            <div
                v-for="img in images"
                :key="img.hash"
                class="item-slot"
                :class="{ selected: selectedImages.has(img.hash) }"
                @click="isBatchMode ? $emit('select', img) : $emit('preview', img)"
            >
                <div v-if="isBatchMode" class="batch-indicator">
                    <svg v-if="selectedImages.has(img.hash)" style="width:12px;height:12px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                    </svg>
                </div>

                <div class="item-image">
                    <img :src="imageDataUrls[img.hash] || PLACEHOLDER" loading="lazy" :alt="img.desc">
                </div>

                <div class="item-info">
                    <div class="item-category">{{ img.category }}</div>
                    <div class="item-meta-row">
                        <span class="scope-pill" :class="img.scope_mode === 'local' ? 'local' : 'public'">
                            {{ img.scope_mode === 'local' ? '本群限定' : '公共' }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `,
};