<script setup>
import { onMounted, provide } from 'vue'
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
const route = useRoute()

import Loading from './components/Loading.vue'

import { where } from 'firebase/firestore'

import { qrcodesGet } from './composables/useUtils'

import Debug from './components/Debug.vue'
import Header from './components/Header.vue'
import HelpIcon from './components/HelpIcon.vue'
import AdminLinks from './components/AdminLinks.vue'
import Dialog from './components/Dialog.vue'
import Auth from './components/Auth.vue'
import ParticipationStatus from './components/ParticipationStatus.vue'

import { global } from './global'

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
    global.qrcodes = await qrcodesGet({
      query: [where('enabled', '==', true)],
    })
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
    <div
      class="min-h-screen flex w-full flex-col gap-3"
      :class="
        route.name === 'admin_accounts'
          ? 'max-w-none px-3 sm:px-5 md:px-8 lg:px-12'
          : 'mx-auto max-w-4xl'
      "
    >
      <Header class="z-2 mt-4" />
      <Auth v-if="$route.name !== 'login'"/>
      <ParticipationStatus v-if="$route.name !== 'login'" class="mb-4"/>
      <RouterView class="" />
      <div v-if="global.account" class="mb-8 text-center text-white">
        {{ global.account.uid }}
      </div>
    </div>
    <HelpIcon v-if="$route.name !== 'home'" class="fixed bottom-4 right-4 z-50" />
    <AdminLinks v-if="global.account?.roles?.includes('admin')" class="fixed bottom-4 left-4 z-50" />
    <Dialog v-if="global.dialog.text != null" />
    <Debug v-if="global.debug" />
  </main>
</template>

