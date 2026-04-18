<script setup>
import { reactive, ref, onMounted, provide, computed } from 'vue'
import { RouterView } from 'vue-router'
import Loading from './components/Loading.vue'

import { collection, getDocs } from 'firebase/firestore'
import { db } from './firebase'

import Debug from './components/Debug.vue'
import Header from './components/Header.vue'
import Auth from './components/Auth.vue'

const global = reactive({
  debug: (() =>{
    //return false // TODO: force debug value
    return [1, 'true'].includes(import.meta.env.VITE_DEBUG) || new URL(window.location.href).searchParams.has('debug')
  })(),
  isAdmin: () => global.account && Array.isArray(global.account.roles) && global.account.roles.includes('admin'),
  loading: false,
  bgColor: '#ccc',
  base_url: import.meta.env.VITE_BASE_URL,
  settings: {
    qrcode_size: 400,
  },
  account: null,
  qrcodes: [],
  user: null,
})





provide('global', global)
provide('reloadQrCodes', loadQrCodes)

/* ── Auth state listener ── */
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, ensureAccountExists } from './firebase'

onMounted(() => {
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
  <main class="border-2 border-red-500 max-w-screen-sm mx-auto" :style="{ backgroundColor: global.bgColor }"  >
    <Header />
    <Auth />
    <RouterView />
    <Debug v-if="global.debug" />
  </main>
</template>

