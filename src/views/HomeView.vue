<script setup>
import { inject, ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { signOut as firebaseSignOut } from 'firebase/auth'
import { auth } from '../firebase'

import Qrcodes from '../components/Qrcodes.vue'
import Quiz from './Quiz.vue'

const global = inject('global')

const phase = computed(() => global.account?.phase ?? 'instructions')

onMounted(() => {
  global.bgColor = '#ccc'
})
</script>

<template>
  <Qrcodes v-if="phase === 'qrcodes'" />
</template>
