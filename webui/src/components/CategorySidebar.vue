<script setup>
defineProps({
    categories: Array,
    selectedCategory: String,
    stats: Object
})

const emit = defineEmits(['select'])
</script>

<template>
    <aside class="sidebar">
        <div class="sidebar-title">分类</div>
        <div class="category-list">
            <div
                class="category-item"
                :class="{ active: selectedCategory === '' }"
                @click="$emit('select', '')"
            >
                <span class="category-name">全部</span>
                <span class="category-count">{{ stats?.total || 0 }}</span>
            </div>
            <div
                v-for="cat in categories"
                :key="cat.key"
                class="category-item"
                :class="{ active: selectedCategory === cat.key }"
                @click="$emit('select', cat.key)"
            >
                <span class="category-name">{{ cat.name }}</span>
                <span class="category-count">{{ cat.count }}</span>
            </div>
        </div>
    </aside>
</template>

<script>
export default {
    name: 'CategorySidebar'
}
</script>