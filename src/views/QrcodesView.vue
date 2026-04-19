<script setup>
import { ref, inject, computed, onMounted } from 'vue'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'

import { useUtils } from '../composables/useUtils'
const utils = useUtils()

import Glass from '../components/Glass.vue'
import { CameraIcon } from '@heroicons/vue/24/solid'
import Scan from '../components/Scan.vue'

const global = inject('global')
const scanning = ref(false)
const points = computed(() => {
  //return 2; // testing
  return global.account?.qrcodes?.length ?? 0
})
const codesToScan = computed(() => global.settings.qrcodes_required - points.value)

onMounted(() => {
  global.bgColor = '#7e63e0'
})

const handleDetected = async (url) => {
  
  const code = url.split('/').pop()
  console.log('url', url, 'code', code)

  const qrcode = global.qrcodes.find((item) => String(item.code) === String(code))
  // check if the qrcode exists
  if (qrcode) {
    // Check if the code has already been scanned
    if (global.account.qrcodes.includes(qrcode.code) && !utils.isAdmin()) {
      global.dialog = {
        text: `Codice <strong>GIA' SCANSIONATO</strong>, RIPROVA!`,
        confirmText: 'Continua',
        onConfirm: () => {
          scanning.value = false
        },
      }
      return
    }
    
    // Add the code to the account
    global.account.qrcodes.push(qrcode.code)
    // Save the account
    await updateDoc(doc(db, 'accounts', global.account.uid), {
      qrcodes: global.account.qrcodes,
    })
    global.dialog = {
      text: `Codice <strong>ACCETTATO</strong>, grazie!`,
      confirmText: 'Continua',
      onConfirm: () => {
        scanning.value = false
      },
    }
    return
  } else {
    global.dialog = {
      text: 'Codice <strong>NON VALIDO</strong>, RIPROVA!',
      confirmText: 'Continua',
      onConfirm: () => {
        scanning.value = false
      },
    }
  }
  return
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
    <header class="flex flex-col items-center justify-center text-center px-12">
      <h2 class="text-3xl font-bold text-white">Cerca e scansiona {{ codesToScan }} QR code per sbloccare il quiz.</h2>
    </header>

    <div class="flex items-center flex-col justify-center">
      <button
        class="btn btn-primary !flex items-center justify-center gap-2"
        type="button"
        @click="()=> {
        scanning = true
      }"
      >
        <CameraIcon class="size-6 shrink-0" aria-hidden="true" />
        Scansiona QRcode
      </button>
    </div>

    <Glass :points="points" />
  </div>
</template>