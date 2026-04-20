<script setup>
import { reactive, ref, onMounted, provide, computed } from 'vue'
import { RouterView } from 'vue-router'
import { useRouter } from 'vue-router'
const router = useRouter()

import Loading from './components/Loading.vue'

import { collection, getDocs } from 'firebase/firestore'
import { db } from './firebase'

import Debug from './components/Debug.vue'
import Header from './components/Header.vue'
import HelpIcon from './components/HelpIcon.vue'
import AdminLinks from './components/AdminLinks.vue'
import Dialog from './components/Dialog.vue'
import Auth from './components/Auth.vue'

const global = reactive({
  debug: (() =>{
    //return false // TODO: force debug value
    return [1, 'true'].includes(import.meta.env.VITE_DEBUG) || new URL(window.location.href).searchParams.has('debug')
  })(),
  isAdmin: () => global.account && Array.isArray(global.account.roles) && global.account.roles.includes('admin'),
  loading: 0,
  bgColor: '#ccc',
  base_url: import.meta.env.VITE_BASE_URL,
  settings: {
    qrcodes: {
      keys: {
        latest: 'qrcocktail-qrcode-latest-scanned',
      },
      required: 3,
      size: 400,
    },
    quiz: {
      questions: {
        count: 3,
      },
    },
    redeem: {
      max: 100,
    },
  },
  account: null,
  qrcodes: [],
  user: null,
  dialog: {},
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
  global.loading ++
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
    global.loading --
  }
}

onMounted(async () => {
  await loadQrCodes()
  //console.log(global.qrcodes)
})
</script>

<template>
  <Loading v-if="global.loading > 0" />
  <main class="mx-auto min-h-screen" :style="{ backgroundColor: global.bgColor }"  >
    <div class="max-w-4xl mx-auto min-h-screen flex flex-col gap-3">
      <Header class="z-2 mt-4" />
      <Auth />
      <RouterView />
    </div>
    <HelpIcon v-if="$route.name !== 'home'" class="fixed bottom-4 right-4 z-50" />
    <AdminLinks v-if="global.account?.roles?.includes('admin')" class="fixed bottom-4 left-4 z-50" />
    <Dialog v-if="global.dialog.text != null" />
    <Debug v-if="global.debug" />
  </main>
</template>

