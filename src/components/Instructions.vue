<script setup>
import { inject } from 'vue'

const global = inject('global')
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
      Scansiona almeno {{ global.settings.qrcodes_required }} QR code che trovi in giro
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
</template>