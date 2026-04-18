<script setup>
import { inject, ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const global = inject('global')

const phase = computed(() => global.account?.phase ?? 'instructions')
const redirectTophase = (newPhase) => {
  if(!global.account) {
    if (newPhase === 'qrcodes') {
      router.push({ name: 'qrcodes_view' })
      console.log('redirecting to qrcodes view')
    }
  }
}
watch(phase, redirectTophase)

onMounted(() => {
  global.bgColor = '#ccc'
  redirectTophase(phase.value)
})
</script>

<template>
  
</template>
