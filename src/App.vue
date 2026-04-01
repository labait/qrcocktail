<script setup>
import { reactive, ref, onMounted, provide } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { db } from './firebase'
import Auth from './Auth.vue'
import Loading from './components/loading.vue'

const global = reactive({
  qrcodes: [],
})

const isLoading = ref(true)

provide('global', global)

async function loadQrCodes() {
  isLoading.value = true
  try {
    const snap = await getDocs(collection(db, 'qrcodes'))
    global.qrcodes = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }))
  } catch (err) {
    console.error(err)
    global.qrcodes = []
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await loadQrCodes()
  console.log(global.qrcodes)
})
</script>

<template>
  <main class="relative flex h-screen items-center justify-center">
    <Loading v-if="isLoading" />
    <Auth />
  </main>
</template>
