<script setup>
import { inject } from 'vue'

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
            onConfirm: async () => {
              global.account.qrcodes = []
              await updateDoc(doc(db, 'accounts', global.account.uid), {
                qrcodes: [],
              })
            },
            onCancel: () => {
              global.dialog = {}
            },
          }
        }"
      >
        Reset
    </button>
  </div>
</template>