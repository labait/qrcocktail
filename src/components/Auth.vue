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
  <div class="flex justify-center gap-4 w-full flex-none">
    <template v-if="!global.user">
      <button
        type="button"
        class="btn btn-primary"
        @click="connectGoogle"
      >
        Connect with Google
      </button>
    </template>
    <template v-else>
      <div class="flex items-center justify-between w-full gap-4 px-6 py-2">
        <div class="avatar flex items-center gap-3 text-white">
          <img
            v-if="global.user.photoURL"
            :src="global.user.photoURL"
            :alt="global.user.displayName || 'Avatar'"
            class="h-10 w-10 rounded-[4px] object-cover ring-2 ring-white/40 shadow-sm"
            width="48"
            height="48"
            referrerpolicy="no-referrer"
          />
          <div
            v-else
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-[6px] bg-slate-200 text-sm font-bold text-slate-700 ring-2 ring-white shadow-sm"
            aria-hidden="true"
          >
            {{ (global.user.displayName || global.user.email || '?').charAt(0).toUpperCase() }}
          </div>
          <div class="">{{ global.user.displayName || global.user.email }}</div>
        </div>
        <RouterLink
          v-if="global.isAdmin()"
          :to="{ name: 'admin_qrcodes_list' }"
          class=""
        >
          Amministrazione
        </RouterLink>
        <a
          href="#"
          class="text-white"
          @click.prevent="logout"
        >
          Logout
        </a>  
      </div>
    </template>
  </div>
</template>
