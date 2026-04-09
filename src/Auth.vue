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
  <div class="flex flex-col items-center gap-4 w-full">
    <template v-if="!appGlobal.user">
      <button
        type="button"
        class="cursor-pointer w-full max-w-xs mt-4 rounded-full bg-brand px-6 py-3.5 text-sm font-bold tracking-wider text-white uppercase shadow-lg transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
        @click="connectGoogle"
      >
        Connect with Google
      </button>
    </template>
    <template v-else>
      
      <!-- Admin Mode Badge -->
      <div v-if="isAdmin" class="w-full bg-slate-900 text-brand text-xs font-black uppercase tracking-[0.2em] py-2 px-4 rounded-md flex items-center justify-between mb-1 shadow-md">
        <span>Admin Mode</span>
        <div class="w-2 h-2 rounded-full bg-brand animate-pulse"></div>
      </div>

      <!-- User Profile Card -->
      <div class="flex items-center gap-4 w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm relative overflow-hidden group">
        <!-- subtle accent line -->
        <div class="absolute left-0 top-0 bottom-0 w-1 bg-brand opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <img
          v-if="appGlobal.user.photoURL"
          :src="appGlobal.user.photoURL"
          :alt="appGlobal.user.displayName || 'Avatar'"
          class="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-sm"
          width="48"
          height="48"
          referrerpolicy="no-referrer"
        />
        <div
          v-else
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700 ring-2 ring-white shadow-sm"
          aria-hidden="true"
        >
          {{ (appGlobal.user.displayName || appGlobal.user.email || '?').charAt(0).toUpperCase() }}
        </div>
        <div class="flex flex-col items-start leading-tight flex-1">
           <span class="text-sm font-bold text-slate-900 tracking-tight">{{ appGlobal.user.displayName || appGlobal.user.email }}</span>
          <a
            href="#"
            class="mt-1 cursor-pointer text-[11px] uppercase tracking-wider font-semibold text-slate-400 hover:text-brand transition-colors"
            @click.prevent="logout"
          >
            Logout
          </a>
        </div>
      </div>

      <!-- Admin Panel Link -->
      <RouterLink
        v-if="isAdmin"
        :to="{ name: 'qrcodes_admin' }"
        class="w-full mt-2 flex items-center justify-between gap-2 rounded-xl bg-slate-900 p-4 text-sm font-bold tracking-widest text-white uppercase hover:bg-slate-800 transition shadow-lg"
      >
        <span>Amministrazione</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-brand" viewBox="0 0 20 20" fill="currentColor">
           <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </RouterLink>
    </template>
  </div>
</template>
