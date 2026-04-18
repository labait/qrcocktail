<script setup>
import { inject, ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const global = inject('global')

const phase = computed(() => global.account?.phase ?? 'instructions')
watch(phase, (newPhase) => {
  if (newPhase === 'qrcodes') {
    router.push({ name: 'qrcodes_view' })
    console.log('redirecting to qrcodes view')
  }
})

onMounted(() => {
  global.bgColor = '#ccc'
})
</script>

<template>
  {{ phase }}
</template>
