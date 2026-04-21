<script setup>
import { inject, onMounted, ref } from 'vue'
import { where } from 'firebase/firestore'

import { useUtils } from '../composables/useUtils'

const global = inject('global')
const utils = useUtils()

const count = ref(null)

onMounted(async () => {
  const list = await utils.accountsGet({
    query: [where('redeemed_at', '!=', null)],
  })
  count.value = list.length
})
</script>

<template>
  <p
    v-if="count !== null"
    class="m-0 text-cente"
  >
    Riscattati {{ count }} premi su {{ global.settings.redeem.max }} totali
  </p>
</template>
