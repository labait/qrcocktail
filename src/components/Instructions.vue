<script setup>
import { inject } from 'vue'

const global = inject('global')
</script>

<template>
  <div class="text-center mb-8"> 
    <p class="text-xl text-gray-500 mb-8">Segui le istruzioni per partecipare!</p>
    <ul class="list-inside space-y-4 max-w-64 mx-auto">
      <li class="text-lg flex flex-col items-center gap-4">
        <div class="font-bold rounded-full text-xl bg-white text-black w-12 h-12 flex items-center justify-center">
          1
        </div>
        Scansiona almeno {{ global.settings.qrcodes_required }} QR code che trovi in giro per sbloccare il quiz
      </li>
      <li class="text-lg flex flex-col items-center gap-4">
        <div class="font-bold rounded-full text-xl bg-white text-black w-12 h-12 flex items-center justify-center">
          2
        </div> 
        Completa il quiz con le risposte corrette
      </li>
      <li class="text-lg flex flex-col items-center gap-4">
        <div class="font-bold rounded-full text-xl bg-white text-black w-12 h-12 flex items-center justify-center">
          3
        </div> 
        Ricevi il cocktail omaggio
      </li>
    </ul>
  </div>
</template>