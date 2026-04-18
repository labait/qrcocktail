<script setup>
import { inject } from 'vue'

import { useUtils } from '../composables/useUtils'
const utils = useUtils()

</script>

<template class="z-20">
  <a class="cursor-pointer flex items-center justify-center p-4" @click="()=> { utils.redirectToPhase() }">
    <img src="../assets/Laba-logo.svg" class="logo-laba w-full max-w-64" alt="LABA Logo" />
  </a>
</template>