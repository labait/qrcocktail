<script setup>
import { reactive, ref, onMounted, provide } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { db } from './firebase'

import { RouterView } from 'vue-router'
import Auth from './Auth.vue'
import Loading from './components/loading.vue'

const global = reactive({
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

const isLoading = ref(true)

provide('global', global)
provide('reloadQrCodes', loadQrCodes)

async function loadQrCodes() {
  isLoading.value = true
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
    isLoading.value = false
  }
}

onMounted(async () => {
  await loadQrCodes()
  console.log(global.qrcodes)
})
</script>

<template>
  <main class="relative flex min-h-screen flex-col items-center">
    <Loading v-if="isLoading" />
    <div class="flex w-full shrink-0 flex-col items-center pt-6">
      <Auth />
    </div>
    <div class="flex w-full flex-1 flex-col items-center justify-center pb-8">
      <RouterView />
    </div>
  </main>
</template>
