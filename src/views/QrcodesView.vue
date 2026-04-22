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
const scanRef = ref(null)
/** `null` = verifica in corso; `true` = ancora posti; `false` = contest chiuso */
const redeemAvailable = ref(null)
const points = computed(() => {
  //return 2; // testing
  return global.account?.qrcodes?.length ?? 0
})
const codesToScan = computed(() => global.settings.qrcodes.required - points.value)

/**
 * Messaggi durante la raccolta QR: la prima regola il cui `when(ctx)` è vero vince.
 * `ctx` = { points, required, remaining } con remaining = required - points.
 */
const scanMessageRules = [
  {
    when: ({ points: p }) => p === 0,
    text: ({ remaining }) =>
      `Inizia a scansionare i QR-code, ne mancano ${remaining}.`,
  },
  {
    when: ({ remaining }) => remaining === 1,
    text: () => 'Ci sei quasi, manca ancora solo un codice.',
  },
  {
    when: () => true,
    text: ({ remaining }) =>
      `Trova e scansiona ancora ${remaining} QR-code`,
  },
]

const scanHeadline = computed(() => {
  const required = global.settings.qrcodes.required
  const pts = points.value
  const remaining = required - pts
  if (remaining <= 0) return ''
  const ctx = { points: pts, required, remaining }
  const rule = scanMessageRules.find((r) => r.when(ctx))
  return rule ? rule.text(ctx) : ''
})

const quizReadyHeadline = computed(() => {
  const n = global.settings.qrcodes.required
  return `Bene! Hai trovato tutti i ${n} QR-code, ora puoi completare il quiz.`
})

onMounted(async () => {
  global.bgColor = '#4F485F'
  redeemAvailable.value = await utils.redeemAvailable()
  if (redeemAvailable.value === false) {
    global.dialog = {
      text: 'Contest non più disponibile',
      confirmText: 'OK',
    }
  }
  // check if there is a latest qrcode in local storage
  const latest = await utils.qrcodeLatestGet()
  if (latest) {
    await utils.qrcodeHandle(latest)
    await utils.qrcodeLatestDelete()
  }
})


const handleDetected = async (url) => {
  const code = url.split('/').pop()
  console.log('handleDetected url', url, 'code', code)
  await utils.qrcodeHandle(code)
  scanning.value = false
}

/** iOS richiede che getUserMedia parta nello stesso “turno” del tap: start() subito dopo il click. */
function beginScan() {
  if (redeemAvailable.value !== true) return
  scanning.value = true
  scanRef.value?.start()
}

function closeScanner() {
  scanRef.value?.stop()
  scanning.value = false
}

function onScanError(err) {
  console.error('Scan error:', err)
  closeScanner()
}
</script>


<template> 
  <div class=" flex min-h-[60vh] flex-1 flex-col">
    <Scan
      v-show="scanning"
      ref="scanRef"
      :auto-start="false"
      @detected="handleDetected"
      @error="onScanError"
      @exit="closeScanner"
    />
    <div v-show="!scanning" class="flex flex-1 flex-col space-y-8">

    <template v-if="codesToScan > 0">
      <header class="flex flex-col items-center justify-center text-center px-12">
        <h2 class="text-3xl font-bold text-white">{{ scanHeadline }}</h2>
      </header>

      <div class="flex items-center flex-col justify-center">
        <button
          class="btn btn-primary flex! items-center justify-center gap-2 disabled:pointer-events-none disabled:opacity-45"
          type="button"
          :disabled="redeemAvailable !== true"
          @click="beginScan"
        >
          <CameraIcon class="size-6 shrink-0" aria-hidden="true" />
          Scansiona QRcode
        </button>
      </div>
    </template>
    <template v-else>
      <header class="flex flex-col items-center justify-center text-center px-12">
        <h2 class="text-3xl font-bold text-white">{{ quizReadyHeadline }}</h2>
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

    <Glass :points="points" class="mb-8"   />
    </div>
  </div>
</template>