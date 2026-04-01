<script setup>
import { ref, onMounted, inject } from 'vue'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth, googleProvider, ensureAccountExists } from './firebase'

import Loading from './components/loading.vue'

const appGlobal = inject('global')
const authLoading = ref(true)

onMounted(() => {
  onAuthStateChanged(auth, (u) => {
    appGlobal.user = u
    if (u) {
      ensureAccountExists(u.uid).then(() => {
        authLoading.value = false
      }).catch((err) => {
        console.error(err)
        authLoading.value = false
      })
    } else {
      authLoading.value = false
    }
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
        class="cursor-pointer rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
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
    </template>
  </div>
</template>
