<script setup>
import { ref, inject, computed, onMounted } from 'vue'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'

import { useUtils } from '../composables/useUtils'
const utils = useUtils()

import { CameraIcon } from '@heroicons/vue/24/solid'
import Scan from '../components/Scan.vue'

const global = inject('global')
const scanning = ref(false)
const codesScanned = computed(() => {
  //return 2; // testing
  return global.account?.qrcodes?.length ?? 0
})
const codesToScan = computed(() => global.settings.qrcodes_required - codesScanned.value)

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
    if (global.account.qrcodes.includes(qrcode.code)) {
      global.dialog = {
        text: 'Codice già scansionato, RIPROVA!',
        confirmText: 'Prosegui',
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
      text: 'Codice scansionato, grazie!',
      confirmText: 'Prosegui',
      onConfirm: () => {
        scanning.value = false
      },
    }
    return
  } else {
    global.dialog = {
      text: 'Codice non trovato, riprova.',
      confirmText: 'Prosegui',
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
      <button
        v-if="utils.isAdmin() && global.account?.qrcodes?.length > 0"
        class="cursor-pointer mt-4 text-white hover:underline"
        type="button"
        @click=" async () => {
          console.log('resetting')
          global.dialog = {
            text: 'Reset, sei sicuro?',
            confirmText: 'Reset',
            onConfirm: async () => {
              global.account.qrcodes = []
              await updateDoc(doc(db, 'accounts', global.account.uid), {
                qrcodes: [],
              })
            },
          }
        }"
      >
        Reset
      </button>
    </div>
      <!-- Bicchiere cocktail animato -->
      <div class="glass-wrapper h-[30vh] min-[390px]:h-[45vh] md:h-[55vh] p-4">
        <svg class="glass-svg w-full h-full object-contain" viewBox="0 0 200 190" xmlns="http://www.w3.org/2000/svg">
          <!-- Clip per il riempimento -->
          <defs>
            <clipPath id="glass-clip">
              <!-- Forma approssimata del bicchiere (zona liquido) -->
              <polygon points="30,10 170,10 115,130 115,175 85,175 85,130"/>
            </clipPath>
          </defs>

          <!-- Riempimento a 3 livelli separati (sfumature di arancione) -->
          <g clip-path="url(#glass-clip)">
            <!-- Livello 1 -->
            <rect x="0" :y="codesScanned >= 1 ? 90 : 178" width="200" :height="codesScanned >= 1 ? 40 : 0" fill="#ffaa55" style="transition: all 0.6s ease" />
            <!-- Livello 2 -->
            <rect x="0" :y="codesScanned >= 2 ? 50 : 90" width="200" :height="codesScanned >= 2 ? 40 : 0" fill="#ff8d3f" style="transition: all 0.6s ease 0.1s" />
            <!-- Livello 3 -->
            <rect x="0" :y="codesScanned >= 3 ? 10 : 50" width="200" :height="codesScanned >= 3 ? 40 : 0" fill="#ff7230" style="transition: all 0.6s ease 0.2s" />
          </g>

          <!-- Suddivisioni del bicchiere (sempre visibili) -->
          <line x1="0" y1="90" x2="200" y2="90" stroke="rgba(255,255,255,0.4)" stroke-width="3" stroke-dasharray="5,4" />
          <line x1="0" y1="50" x2="200" y2="50" stroke="rgba(255,255,255,0.4)" stroke-width="3" stroke-dasharray="5,4" />

          <!-- Contorno bicchiere (stroke arancione, sempre visibile) -->
          <polygon
            points="30,10 170,10 115,130 85,130"
            fill="none" stroke="#ff7230" stroke-width="12"
            stroke-linejoin="round"
          />

          <!-- Gambo -->
          <line x1="100" y1="130" x2="100" y2="178" stroke="#ff7230" stroke-width="12" stroke-linecap="round"/>
          <!-- Base -->
          <line x1="65" y1="178" x2="135" y2="178" stroke="#ff7230" stroke-width="12" stroke-linecap="round"/>
        </svg>
      </div>
  </div>
</template>