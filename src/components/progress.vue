<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'
import Qrcode from './qrcode.vue'

const router = useRouter()
const uid = ref(null)

onMounted(() => {
  onAuthStateChanged(auth, (u) => {
    uid.value = u?.uid ?? null
  })
})

/** Test: per ora sempre true */
const userCanRedeem = computed(() => true)

const userQrPath = computed(() => {
  if (!uid.value) return ''
  return router.resolve({
    name: 'qrcode_redeem',
    params: { uid: uid.value },
  }).path
})
</script>

<template>
  <div v-if="userCanRedeem && userQrPath" class="flex flex-col items-center gap-2">
    <Qrcode :path="userQrPath" />
  </div>
</template>
