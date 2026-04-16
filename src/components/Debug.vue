<script setup>
import { inject, ref } from 'vue'

const global = inject('global')
const isCollapsed = ref(false)

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<template>
  <div class="fixed border border-gray-300 bottom-0 left-0 right-0 bg-white/50 backdrop-blur-sm z-50" >
    <!-- Header bar with close/expand button -->
    <div class="flex justify-end items-center p-2 ">
      <button 
        @click="toggleCollapse"
        class="text-md cursor-pointer hover:opacity-70 transition-opacity"
        :aria-label="isCollapsed ? 'Expand debug' : 'Collapse debug'"
      >
        {{ isCollapsed ? 'open' : 'close' }}
      </button>
    </div>

    <!-- Debug content (hidden when collapsed) -->
    <div v-if="!isCollapsed" class="p-4" :class="{ 'overflow-auto': !isCollapsed }">
      <pre class="h-64">
    {{ global }}
      </pre>
    </div>
  </div>
</template>