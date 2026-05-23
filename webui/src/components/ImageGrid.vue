<script setup>
defineProps({
  images: Array,
  imageDataUrls: Object,
  isBatchMode: Boolean,
  selectedImages: Set,
  PLACEHOLDER: String,
});

const emit = defineEmits(['select', 'preview']);
</script>

<template>
  <div class="inventory-grid">
    <div
      v-for="img in images"
      :key="img.hash"
      class="item-slot"
      :class="{ selected: selectedImages.has(img.hash) }"
      @click="isBatchMode ? $emit('select', img) : $emit('preview', img)"
    >
      <div v-if="isBatchMode" class="batch-indicator">
        <IconCheck
          v-if="selectedImages.has(img.hash)"
          style="width: 12px; height: 12px"
        />
      </div>
      <div class="item-image">
        <img :src="imageDataUrls[img.hash] || PLACEHOLDER" loading="lazy" :alt="img.desc" />
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
</template>

<script>
export default {
  name: 'ImageGrid',
};
</script>
