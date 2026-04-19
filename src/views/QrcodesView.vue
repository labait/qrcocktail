<script setup>
import { ref, inject, computed, onMounted } from 'vue'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'

import { useUtils } from '../composables/useUtils'
const utils = useUtils()

import Glass from '../components/Glass.vue'
import { CameraIcon, ListBulletIcon } from '@heroicons/vue/24/solid'
import Scan from '../components/Scan.vue'

const global = inject('global')
const scanning = ref(false)
const points = computed(() => {
  //return 2; // testing
  return global.account?.qrcodes?.length ?? 0
})
const codesToScan = computed(() => global.settings.qrcodes.required - points.value)

onMounted(async () => {
  global.bgColor = '#4F485F'
  // check if there is a latest qrcode in local storage
  const latest = await utils.qrcodeLatestGet()
  if (latest) {
    await utils.qrcodeHandle(latest)
    await utils.qrcodeLatestDelete()
  }
})


const handleDetected = async (url) => {
  const code = url.split('/').pop()
  console.log('url', url, 'code', code)
  await utils.qrcodeHandle(code)
  scanning.value = false
}
</script>


<template>
  <template v-if="scanning">
    <Scan 
      @detected="handleDetected" 
      @exit="()=> { scanning = false }" 
    />
  </template>
  <div v-else class="flex-1 flex flex-col space-y-8">

    <template v-if="codesToScan > 0">
      <header class="flex flex-col items-center justify-center text-center px-12">
        <h2 class="text-3xl font-bold text-white">Cerca {{ points > 0 ?  'ancora' : 'almeno' }} {{ codesToScan }} QR-code per sbloccare il quiz.</h2>
      </header>

      <div class="flex items-center flex-col justify-center">
        <button
          class="btn btn-primary flex! items-center justify-center gap-2"
          type="button"
          @click="()=> {
          scanning = true
        }"
        >
          <CameraIcon class="size-6 shrink-0" aria-hidden="true" />
          Scansiona QRcode
        </button>
      </div>
    </template>
    <template v-else>
      <header class="flex flex-col items-center justify-center text-center px-12">
        <h2 class="text-3xl font-bold text-white">Bene! Hai trovato tutti i {{ global.settings.qrcodes.required }} QR-code, ora puoi completare il quiz.</h2>
      </header>
      <div class="flex items-center flex-col justify-center"> 
        <button
          class="btn btn-primary flex! items-center justify-center gap-2"
          type="button"
          @click="()=> {
            utils.setPhase('quiz')
          }"
        >
          <ListBulletIcon class="size-6 shrink-0" aria-hidden="true" />
          Vai al quiz
        </button>
      </div>
    </template>

    <Glass :points="points" />
  </div>
</template>