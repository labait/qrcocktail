<script setup>
import { inject, computed } from 'vue'
import { useRoute } from 'vue-router'
import Qrcode from '../components/qrcode.vue'

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

const qrPath = computed(() => (code.value ? `/qcodes/${code.value}` : ''))
</script>

<template>
  <div class="flex flex-col items-center gap-4 px-4 py-8">
    <template v-if="code && qrcode">
      <Qrcode :path="qrPath" />
    </template>
    <p v-else-if="code && !qrcode" class="text-center text-lg text-red-600">
      Codice non trovato
    </p>
    <p v-else class="text-slate-600">Nessun codice specificato.</p>
  </div>
</template>
