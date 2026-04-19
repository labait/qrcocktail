<script setup>
import { inject } from 'vue'

import { RouterLink } from 'vue-router'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'

import { useUtils } from '../composables/useUtils'
const utils = useUtils()

const global = inject('global')
</script>

<template>
  <div class="flex flex-row gap-4 bg-white/40 p-4 rounded-lg">
    <RouterLink :to="{ name: 'admin_qrcodes_list' }" class="text-white underline-offset-2 hover:underline">Admin</RouterLink>
    <button
        class="cursor-pointer text-white hover:underline"
        type="button"
        @click=" async () => {
          console.log('resetting')
          global.dialog = {
            text: 'Reset, sei sicuro?',
            confirmText: 'Reset',
            onConfirm: utils.reset,
          }
        }"
      >
        Reset
    </button>
  </div>
</template>