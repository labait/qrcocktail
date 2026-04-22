<script setup>
import { inject, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { signInWithPopup } from 'firebase/auth'
import {
  auth,
  googleProvider,
  microsoftProvider,
  syncAccountFromAuthProfile,
} from '../firebase'

const global = inject('global')

onMounted(() => {
  global.bgColor = '#ccc'
})

async function connectGoogle() {
  const result = await signInWithPopup(auth, googleProvider)
  await syncAccountFromAuthProfile(
    result.user.uid,
    result.user,
    result.additionalUserInfo,
  )
}

async function connectMicrosoft() {
  const result = await signInWithPopup(auth, microsoftProvider)
  await syncAccountFromAuthProfile(
    result.user.uid,
    result.user,
    result.additionalUserInfo,
  )
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-md flex-col items-center gap-2 px-6 pb-10">
    <h1 class="text-center text-xl font-bold text-gray-900">
      Accedi
    </h1>
    <button
      type="button"
      class="btn !flex !max-w-none w-full items-center justify-center gap-3 !bg-white !text-gray-800 !normal-case border-2 border-gray-200 tracking-normal shadow-md hover:!scale-[1.02]"
      @click="connectGoogle"
    >
      <svg
        class="h-5 w-5 shrink-0"
        viewBox="0 0 18 18"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          fill="#4285F4"
          d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
        />
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
        />
        <path
          fill="#FBBC05"
          d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.348 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"
        />
        <path
          fill="#EA4335"
          d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
        />
      </svg>
      Connettiti con Google
    </button>


    <div class="mt-8 mb-8">
      <p
        class=" mb-4 text-center"
        role="note"
      >
        <span class="font-bold">Sei uno studente Laba?</span><br>
        Ai fini del tracciamento della presenza è necessario collegarsi utilizzando il pulsante qui sotto.<br>
        <span class="whitespace-nowrap font-medium">@laba.edu</span>.
      </p>
      
      <button
        type="button"
        class="btn !flex !max-w-none w-full items-center justify-center gap-3 !bg-white !text-gray-800 !normal-case border-2 border-gray-200 tracking-normal shadow-md hover:!scale-[1.02]"
        @click="connectMicrosoft"
      >
        <svg
          class="h-5 w-5 shrink-0"
          viewBox="0 0 21 21"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect x="1" y="1" width="9" height="9" fill="#f25022" />
          <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
          <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
          <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
        </svg>
        Connetti account laba
      </button>
    </div>

    <RouterLink
      :to="{ name: 'home' }"
      class="text-gray-600 underline-offset-2 hover:underline"
    >
      Torna alla home
    </RouterLink>
  </div>
</template>
