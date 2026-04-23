<script setup>
import { computed, inject } from 'vue'

const global = inject('global')

const scanned = computed(
  () =>
    Array.isArray(global.account?.qrcodes)
      ? global.account.qrcodes.length
      : 0,
)

const threshold = computed(
  () => Number(global.settings?.qrcodes?.participation_threshold) || 0,
)
</script>

<template>
  <div
    v-if="global.account"
    class="flex w-full flex-col items-center gap-1.5 px-4 pb-2"
  >
    <span
      class="inline-flex items-center rounded-full bg-violet-600 px-5 py-3  font-medium text-white shadow-sm ring-1 ring-violet-500/30"
    >
      Codici scansionati: {{ scanned }}
    </span>
    <p class="m-0 text-center  text-white">
      Partecipazione valida con
      <span class="font-semibold ">{{ threshold }}</span>
      codici
    </p>
  </div>
</template>
