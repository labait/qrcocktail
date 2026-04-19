<script setup>
import { ref, onMounted, inject, watch } from 'vue'

import { useUtils } from '../composables/useUtils'
const utils = useUtils()

import { RouterLink, useRouter } from 'vue-router'
const router = useRouter()

import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { auth, db, googleProvider, ensureAccountExists } from '../firebase'
import { accountHasRedeemedAt } from '../utils/accountRedeem'

const global = inject('global')

let accountSnapshotUnsub = null


// watch(() => global.user, (newVal) => {
//   if(!newVal) router.push({ name: 'home' })
// }, { immediate: true })

onMounted(() => {
  onAuthStateChanged(auth, (u) => {
    if (accountSnapshotUnsub) {
      accountSnapshotUnsub()
      accountSnapshotUnsub = null
    }
    global.user = u
    ;(async () => {
      if (u) {
        global.account = null
        try {
          await ensureAccountExists(u.uid)
          const snap = await getDoc(doc(db, 'accounts', u.uid))
          const raw = snap.exists() ? snap.data() : null
          global.account = raw ? { ...raw, uid: u.uid } : null

          /** Stato redeem prima dell’ultimo snapshot (per rilevare solo la transizione “live”) */
          let prevRedeemed = accountHasRedeemedAt(global.account)

          accountSnapshotUnsub = onSnapshot(
            doc(db, 'accounts', u.uid),
            (accountSnap) => {
              if (!accountSnap.exists()) return
              const data = accountSnap.data()
              global.account = { ...data, uid: u.uid }

              const nowRedeemed = accountHasRedeemedAt(data)
              if (
                nowRedeemed &&
                !prevRedeemed &&
                router.currentRoute.value.name !== 'thankyou'
              ) {
                const debug = new URLSearchParams(window.location.search).has(
                  'debug',
                )
                router.push({
                  name: 'thankyou',
                  ...(debug ? { query: { debug: true } } : {}),
                })
              } else if (
                !nowRedeemed &&
                router.currentRoute.value.name === 'thankyou'
              ) {
                utils.redirectToPhase()
              }
              prevRedeemed = nowRedeemed
            },
            (err) => console.error('Account snapshot error:', err),
          )

          // do not redirect if current route is in the list of routes that do not redirect
          const doNotRedirectRoutes = [
            'redeem',
            'qrcode',
            'admin_qrcodes_list',
          ]
          if (!doNotRedirectRoutes.includes(router.currentRoute.value.name)) {
            utils.redirectToPhase()
          }
        } catch (err) {
          console.error(err)
          global.account = null
        } finally {

        }
      } else {
        router.push({ name: 'home' })
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
