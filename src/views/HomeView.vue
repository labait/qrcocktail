<script setup>
import { inject, onMounted } from 'vue'
import { ArrowRightIcon } from '@heroicons/vue/24/solid'

const global = inject('global')

onMounted(() => {
  global.bgColor = '#ccc'
})
</script>

<template>
  <ul class="text-center mb-8 list-inside space-y-8 mx-auto px-12">
    <li class="text-lg flex flex-col items-center gap-2">
      <div class="font-bold rounded-full text-xl bg-white text-black w-12 h-12 flex items-center justify-center">
        1
      </div>
      Accedi con il tuo account Google
    </li>
    <li class="text-lg flex flex-col items-center gap-2">
      <div class="font-bold rounded-full text-xl bg-white text-black w-12 h-12 flex items-center justify-center">
        2
      </div>
      Scansiona almeno {{ global.settings.qrcodes.required }} QR code che trovi in giro
    </li>
    <li class="text-lg flex flex-col items-center gap-2">
      <div class="font-bold rounded-full text-xl bg-white text-black w-12 h-12 flex items-center justify-center">
        3
      </div> 
      Completa il quiz
    </li>
    <li class="text-lg flex flex-col items-center">
      <div class="font-bold rounded-full text-xl bg-white text-black w-12 h-12 flex items-center justify-center">
        4
      </div> 
      Ricevi il cocktail omaggio
    </li>
  </ul>
  <div v-if="global.account" class="flex items-center flex-col justify-center">
    <RouterLink :to="{ name: 'qrcodes' }" class="btn btn-primary flex! items-center justify-center gap-2">
      <ArrowRightIcon class="size-6 shrink-0" aria-hidden="true" />
      Scansiona i QR code
    </RouterLink>
  </div>

</template>