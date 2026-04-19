<script setup>
import { inject, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

const global = inject('global')

onMounted(() => {
  global.bgColor = '#A79ADB'
})
</script>

<template>
  <div class="flex flex-col items-center gap-6 px-6 py-10 text-center text-white">
    <h1 class="m-0 text-3xl font-bold leading-tight">
      Grazie, buon cocktail!
    </h1>
    <p class="m-0 max-w-md text-lg text-white/95">
      Il premio risulta consegnato. Ci vediamo alla prossima iniziativa LABA.
    </p>
    <RouterLink :to="{ name: 'home' }" class="btn btn-secondary mt-2">
      Torna alla home
    </RouterLink>
  </div>
</template>
