<script setup>
import { inject } from 'vue'

const global = inject('global')
</script>

<template>
  <div class="fixed border overflow-auto bottom-0 left-0 right-0 bg-white/50 backdrop-blur-sm p-4">
    <pre class="h-64">
    {{ global }}
    </pre>
  </div>
</template>