// 分页组件
export const PaginationBar = {
    props: {
        currentPage: Number,
        pageSize: Number,
        total: Number,
    },
    emits: ['prev', 'next'],
    template: `
        <div v-if="total > pageSize" class="pagination-bar">
            <button
                @click="$emit('prev')"
                :disabled="currentPage === 1"
                class="codex-btn"
                :class="{ disabled: currentPage === 1 }"
            >
                <svg style="width:16px;height:16px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                上一页
            </button>

            <span class="page-info">{{ currentPage }} / {{ Math.ceil(total / pageSize) }}</span>

            <button
                @click="$emit('next')"
                :disabled="currentPage * pageSize >= total"
                class="codex-btn"
                :class="{ disabled: currentPage * pageSize >= total }"
            >
                下一页
                <svg style="width:16px;height:16px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
            </button>
        </div>
    `,
};