<script setup>
import { inject, computed } from 'vue'
import Progress from '../components/progress.vue'
import Quiz from './Quiz.vue'

const global = inject('global')

const isLoggedIn = computed(() => !!global?.user)
</script>

<template>
  <Quiz />
  <div class="flex w-full max-w-lg flex-col items-center gap-6 px-4 py-8 text-center">
    <p v-if="!isLoggedIn" class="text-lg text-slate-700">
      Benvenuto. Accedi per continuare e vedere i tuoi progressi.
    </p>
    <Progress v-else />
  </div>
  
</template>
