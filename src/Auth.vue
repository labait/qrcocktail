<script setup>
import { ref, onMounted, inject, computed } from 'vue'
import { RouterLink } from 'vue-router'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, googleProvider, ensureAccountExists } from './firebase'

import Loading from './components/loading.vue'

const appGlobal = inject('global')
const authLoading = ref(true)

const isAdmin = computed(
  () => Array.isArray(appGlobal.roles) && appGlobal.roles.includes('admin'),
)

onMounted(() => {
  onAuthStateChanged(auth, (u) => {
    appGlobal.user = u
    ;(async () => {
      if (u) {
        appGlobal.accountReady = false
        try {
          await ensureAccountExists(u.uid)
          const snap = await getDoc(doc(db, 'accounts', u.uid))
          const raw = snap.exists() ? snap.data().roles : []
          appGlobal.roles = Array.isArray(raw) ? raw : []
        } catch (err) {
          console.error(err)
          appGlobal.roles = []
        } finally {
          appGlobal.accountReady = true
          authLoading.value = false
        }
      } else {
        appGlobal.roles = []
        appGlobal.accountReady = true
        authLoading.value = false
      }
    })()
  })
})

async function connectGoogle() {
  await signInWithPopup(auth, googleProvider)
}

async function logout() {
  await firebaseSignOut(auth)
}
</script>

<template>
  <Loading v-if="authLoading" />
  <div class="flex flex-col items-center gap-4">
    <template v-if="!appGlobal.user">
      <button
        type="button"
        class="cursor-pointer rounded-lg bg-slate-900 px-5 py-2.5 text-base font-medium text-white shadow transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        @click="connectGoogle"
      >
        Connect with Google
      </button>
    </template>
    <template v-else>
      <div class="flex items-center gap-3">
        <img
          v-if="appGlobal.user.photoURL"
          :src="appGlobal.user.photoURL"
          :alt="appGlobal.user.displayName || 'Avatar'"
          class="h-14 w-14 rounded-full border-2 border-slate-200 object-cover shadow"
          width="56"
          height="56"
          referrerpolicy="no-referrer"
        />
        <div
          v-else
          class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 bg-slate-100 text-base font-semibold text-slate-600 shadow"
          aria-hidden="true"
        >
          {{ (appGlobal.user.displayName || appGlobal.user.email || '?').charAt(0).toUpperCase() }}
        </div>
        <a
          href="#"
          class="cursor-pointer font-medium text-blue-600 underline underline-offset-2 hover:text-blue-800"
          @click.prevent="logout"
        >
          Logout
        </a>
      </div>
      <RouterLink
        v-if="isAdmin"
        :to="{ name: 'qrcodes_admin' }"
        class="text-base font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900"
      >
        Amministrazione QR code
      </RouterLink>
    </template>
  </div>
</template>
