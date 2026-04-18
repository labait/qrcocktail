<script setup>
import { RouterLink } from 'vue-router'
import { QuestionMarkCircleIcon } from '@heroicons/vue/24/outline'
</script>

<template>
  <RouterLink
    :to="{ name: 'home' }"
    class="fixed bottom-4 right-4 z-50 rounded-full bg-white/90 p-1.5 text-neutral-800 shadow-sm ring-1 ring-black/5 transition duration-200 ease-out hover:scale-105 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"
    aria-label="Vai alla home"
  >
    <QuestionMarkCircleIcon class="size-10" aria-hidden="true" />
  </RouterLink>
</template>
