<script setup>
import { reactive, ref, onMounted, provide } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { db } from './firebase'

import { RouterView } from 'vue-router'
import Auth from './Auth.vue'
import Loading from './components/loading.vue'

const global = reactive({
  debug: true,
  loading: false,
  base_url: import.meta.env.VITE_BASE_URL,
  user: null,
  /** Ruoli da `accounts/{uid}.roles` in Firestore */
  roles: [],
  /** True dopo il primo aggiornamento utente/ruoli da `onAuthStateChanged` */
  accountReady: false,
  settings: {
    qrcode_size: 400,
  },
  qrcodes: [],
})


provide('global', global)
provide('reloadQrCodes', loadQrCodes)

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
  <main class="relative flex min-h-screen flex-col mx-auto max-w-lg w-full bg-white text-slate-900 font-sans">
    
    <!-- Top centered logo placeholder -->
    <header class="w-full flex justify-center pt-10 pb-8">
      <img 
        src="https://placehold.co/240x80/ffffff/ff7230?font=inter&text=BRAND+LOGO" 
        alt="Brand Logo" 
        class="h-14 w-auto object-contain select-none" 
      />
    </header>

    <Loading v-if="global.loading" />
    
    <!-- Auth Profile Area -->
    <div class="flex w-full shrink-0 flex-col items-center px-6">
      <Auth />
    </div>
    
    <!-- Edge-to-edge separator -->
    <div class="w-full h-px bg-slate-100 my-6"></div>
    
    <!-- Main View Content -->
    <div class="flex w-full flex-1 flex-col items-center justify-start px-6 pb-12">
      <RouterView />
    </div>
  </main>
</template>
