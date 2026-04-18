<script setup>
import { ref, onMounted, inject, computed } from 'vue'
import { RouterLink } from 'vue-router'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, googleProvider, ensureAccountExists } from '../firebase'

const global = inject('global')



onMounted(() => {
  onAuthStateChanged(auth, (u) => {
    global.user = u
    ;(async () => {
      if (u) {
        global.account = null
        try {
          await ensureAccountExists(u.uid)
          const snap = await getDoc(doc(db, 'accounts', u.uid))
          const raw = snap.exists() ? snap.data() : null
          global.account = raw ?? null
        } catch (err) {
          console.error(err)
          global.account = null
        } finally {

        }
      } else {
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
    <template v-if="!global.user">
      <button
        type="button"
        class="cursor-pointer w-full max-w-xs mt-4 rounded-full bg-brand px-6 py-3.5 text-sm font-bold tracking-wider text-white uppercase shadow-lg transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
        @click="connectGoogle"
      >
        Connect with Google
      </button>
    </template>
    <template v-else>
      
      <!-- User Profile Card -->
      <div class="flex items-center gap-4 w-full p-4 ">
        <!-- subtle accent line -->
        <div class="absolute left-0 top-0 "></div>
        <img
          v-if="global.user.photoURL"
          :src="global.user.photoURL"
          :alt="global.user.displayName || 'Avatar'"
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
          {{ (global.user.displayName || global.user.email || '?').charAt(0).toUpperCase() }}
        </div>
        <div class=" flex items-center gap-4">
          <span class="">{{ global.user.displayName || global.user.email }}</span>
          <RouterLink
            v-if="global.isAdmin()"
            :to="{ name: 'admin_qrcodes_list' }"
            class=""
          >
          Amministrazione
          </RouterLink>
          <a
            href="#"
            class=""
            @click.prevent="logout"
          >
            Logout
          </a>
        </div>
      </div>
    </template>
  </div>
</template>
