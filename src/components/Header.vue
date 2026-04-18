<script setup>
import { inject } from 'vue'
import { RouterLink } from 'vue-router'

const global = inject('global')
</script>

<template>
  <RouterLink :to="{ name: 'home' }" class="flex items-center justify-center p-4">
    <img src="../assets/Laba-logo.svg" class="logo-laba max-w-24" alt="LABA Logo" />
  </RouterLink>
</template>