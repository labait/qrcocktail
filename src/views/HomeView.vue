<script setup>
import { inject, ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const global = inject('global')

onMounted(() => {
  global.bgColor = '#ccc'
  global.redirectToPhase('instructions')
})
</script>

<template>
  
</template>
