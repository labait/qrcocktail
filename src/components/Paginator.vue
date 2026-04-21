<script setup>
import { computed, watch } from 'vue'

const props = defineProps({
  /** Numero totale di elementi da paginare (qualsiasi dataset). */
  totalItems: {
    type: Number,
    required: true,
  },
  /** Elementi per pagina. */
  pageSize: {
    type: Number,
    default: 10,
  },
  /** Pagina corrente (1-based). Usare v-model. */
  modelValue: {
    type: Number,
    default: 1,
  },
})

const emit = defineEmits(['update:modelValue'])

const totalPages = computed(() => {
  if (props.totalItems <= 0) return 0
  return Math.ceil(props.totalItems / props.pageSize)
})

const safePage = computed(() => {
  const tp = totalPages.value
  if (tp === 0) return 1
  return Math.min(Math.max(1, props.modelValue), tp)
})

const rangeStart = computed(() => {
  if (props.totalItems === 0) return 0
  return (safePage.value - 1) * props.pageSize + 1
})

const rangeEnd = computed(() => {
  if (props.totalItems === 0) return 0
  return Math.min(safePage.value * props.pageSize, props.totalItems)
})

function goToPage(page) {
  const tp = totalPages.value
  if (tp === 0) return
  const next = Math.min(Math.max(1, page), tp)
  if (next !== props.modelValue) emit('update:modelValue', next)
}

watch(
  () => [props.totalItems, props.pageSize],
  () => {
    const tp = totalPages.value
    if (tp === 0 && props.modelValue !== 1) {
      emit('update:modelValue', 1)
      return
    }
    if (tp > 0 && props.modelValue > tp) {
      emit('update:modelValue', tp)
    }
  },
  { immediate: true },
)
</script>

<template>
  <nav
    class="flex flex-col items-center gap-3 sm:flex-row sm:justify-between sm:gap-4"
    aria-label="Paginazione"
  >
    <p class="m-0 text-center text-base sm:text-left">
      <template v-if="totalItems > 0">
        <span class="">
          {{ rangeStart }} -  {{ rangeEnd }} di {{ totalItems }}
        </span>
      </template>
    </p>

    <div
      v-if="totalPages > 0"
      class="flex flex-wrap items-center justify-center gap-2"
    >
      <button
        type="button"
        class="btn btn-secondary px-3! py-2! text-base"
        :disabled="safePage <= 1"
        aria-label="Pagina precedente"
        @click="goToPage(safePage - 1)"
      >
        <
      </button>
      <span class="min-w-32 text-center text-base tabular-nums text-slate-800">
        Pagina {{ safePage }} di {{ totalPages }}
      </span>
      <button
        type="button"
        class="btn btn-secondary px-3! py-2! text-base"
        :disabled="safePage >= totalPages"
        aria-label="Pagina successiva"
        @click="goToPage(safePage + 1)"
      >
        >
      </button>
    </div>
  </nav>
</template>
