<script setup>
import { ref, onMounted, inject, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, googleProvider, ensureAccountExists } from '../firebase'

const global = inject('global')
const router = useRouter()

// watch(() => global.user, (newVal) => {
//   if(!newVal) router.push({ name: 'home' })
// }, { immediate: true })

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
          //global.redirectToPhase(global.account?.phase ?? 'instructions')
        } catch (err) {
          console.error(err)
          global.account = null
        } finally {

        }
      } else {
        router.push({ name: 'instructions' })
      }
    })()
  })
})

async function connectGoogle() {
  await signInWithPopup(auth, googleProvider)
}

async function logout() {
  await firebaseSignOut(auth)
  global.user = null
  global.account = null
}
</script>

<template>
  <div class="flex justify-center w-full flex-none mb-8">
    <template v-if="!global.user">
      <button
        type="button"
        class="btn btn-primary"
        @click="connectGoogle"
      >
        Accedi con Google
      </button>
    </template>
    <template v-else>
      <div class="flex items-center justify-center w-full gap-4 px-6 py-2">
        <div class="avatar flex items-center gap-3 text-white">
          <img
            v-if="global.user.photoURL"
            :src="global.user.photoURL"
            :alt="global.user.displayName || 'Avatar'"
            class="h-10 w-10 rounded-full object-cover ring-2 shadow-sm"
            referrerpolicy="no-referrer"
          />
          <div
            v-else
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-[6px] bg-slate-200 text-sm font-bold text-slate-700 ring-2 ring-white shadow-sm"
            aria-hidden="true"
          >
            {{ (global.user.displayName || global.user.email || '?').charAt(0).toUpperCase() }}
          </div>
          <div class="capitalize">{{ global.user.displayName || global.user.email }}</div>
        </div>
        <RouterLink :to="{ name: 'admin_qrcodes_list' }" v-if="global.account?.roles?.includes('admin')" class="text-white underline-offset-2 hover:underline">Admin</RouterLink>
        <a
          href="#"
          class="text-white underline-offset-2 hover:underline"
          @click.prevent="logout"
        >
          Logout
        </a>  
      </div>
    </template>
  </div>
</template>
