<script setup>
import { ref, onMounted } from 'vue'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth, googleProvider, ensureAccountExists } from './firebase'

const user = ref(null)

onMounted(() => {
  onAuthStateChanged(auth, (u) => {
    user.value = u
    if (u) {
      ensureAccountExists(u.uid).catch((err) => console.error(err))
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
  <div class="flex flex-col items-center gap-4">
    <template v-if="!user">
      <button
        type="button"
        class="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        @click="connectGoogle"
      >
        Connect with Google
      </button>
    </template>
    <template v-else>
      <div class="flex items-center gap-3">
        <img
          v-if="user.photoURL"
          :src="user.photoURL"
          :alt="user.displayName || 'Avatar'"
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
          {{ (user.displayName || user.email || '?').charAt(0).toUpperCase() }}
        </div>
        <a
          href="#"
          class="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-800"
          @click.prevent="logout"
        >
          Logout
        </a>
      </div>
    </template>
  </div>
</template>
