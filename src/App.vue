<script setup>
import { reactive, ref, onMounted, provide } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { db } from './firebase'
import Debug from './components/Debug.vue'

import { RouterView } from 'vue-router'
import Loading from './components/Loading.vue'

const global = reactive({
  debug: true,
  loading: false,
  base_url: import.meta.env.VITE_BASE_URL,
  user: null,
  /** Dati account da Firestore (`accounts/{uid}`) — contiene phase, qrcodes, roles */
  account: {},
  /** True dopo il primo aggiornamento utente/account da `onAuthStateChanged` */
  accountReady: false,
  settings: {
    qrcode_size: 400,
  },
  qrcodes: [],
})


provide('global', global)
provide('reloadQrCodes', loadQrCodes)

/* ── Auth state listener ── */
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, ensureAccountExists } from './firebase'

onMounted(() => {
  onAuthStateChanged(auth, (u) => {
    global.user = u
    ;(async () => {
      if (u) {
        global.accountReady = false
        try {
          await ensureAccountExists(u.uid)
          const snap = await getDoc(doc(db, 'accounts', u.uid))
          const raw = snap.exists() ? snap.data() : {}
          global.account = raw
        } catch (err) {
          console.error(err)
          global
        } finally {
          global.accountReady = true
        }
      } else {
        global.account = {}
        global.accountReady = true
      }
    })()
  })
})

async function loadQrCodes() {
  global.loading = true
  try {
    const snap = await getDocs(collection(db, 'qrcodes'))
    global.qrcodes = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }))
  } catch (err) {
    console.error(err)
    global.qrcodes = []
  } finally {
    global.loading = false
  }
}

onMounted(async () => {
  await loadQrCodes()
  console.log(global.qrcodes)
})
</script>

<template>
  <Loading v-if="global.loading" />
  <main class="app-shell">
    
    <RouterView />
    <Debug v-if="global.debug" />
  </main>
</template>

