<script setup>
import { inject, computed, onMounted } from 'vue'

import { useRoute, useRouter } from 'vue-router'
const router = useRouter()

import { useUtils } from '../composables/useUtils'
const utils = useUtils()

import Qrcode from '../components/Qrcode.vue'

const route = useRoute()
const global = inject('global')

/** Codice da path `/qrcodes/:code` o, in alternativa, da query `?code=` */
const code = computed(() => {
  const fromParam = route.params.code
  const fromQuery = route.query.code
  const p = typeof fromParam === 'string' ? fromParam : ''
  const q = typeof fromQuery === 'string' ? fromQuery : ''
  return p || q || ''
})

const qrcode = computed(() => {
  const c = code.value
  if (!c) return null
  return global.qrcodes.find((item) => String(item.code) === String(c)) ?? null
})

const url = computed(() => (code.value ? utils.getAbsoluteUrl(`/qcodes/${code.value}`) : ''))

onMounted(async () => {
  utils.qrcodeLatestSet(code.value)
  //if(!utils.isAdmin()) router.push({ name: 'qrcodes' })
})

</script>

<template>
  <div class="flex flex-col items-center gap-4 px-4">
    <template v-if="code && qrcode">
      <Qrcode :url="url"/>
      {{ url }}
    </template>
    <p v-else-if="code && !qrcode" class="text-center text-lg text-red-600">
      Codice non trovato
    </p>
    <p v-else class="text-slate-600">Nessun codice specificato.</p>
  </div>
  <div v-if="utils.isAdmin()" class="flex justify-center">
    <button
      type="button"
      class="btn btn-secondary"
      @click="router.push({ name: 'qrcodes' })"
    >
      Elabora codice
    </button>
  </div>
</template>
