<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAdminGuard } from '../composables/useAdminGuard'

// Solo l'admin (il manager) può accedere a questa route
useAdminGuard()

const route = useRoute()
const uid = route.params.uid
const status = ref('loading') // loading, not_ready, redeemed, ready, success, error
const errorMsg = ref('')

onMounted(async () => {
  try {
    const docRef = doc(db, 'accounts', uid)
    const snap = await getDoc(docRef)
    if (snap.exists()) {
      const data = snap.data()

      // Verifica che l'utente abbia un coupon_code valido
      if (!data.coupon_code) {
        status.value = 'not_ready'
        errorMsg.value = "L'utente non ha ancora generato un coupon."
        return
      }

      if (data.phase === 'thanks') {
        status.value = 'redeemed'
      } else if (data.phase === 'redeem') {
        status.value = 'ready'
      } else {
        status.value = 'not_ready'
      }
    } else {
      status.value = 'not_ready'
      errorMsg.value = 'Utente non trovato nel database.'
    }
  } catch(e) {
    status.value = 'error'
    errorMsg.value = e.message
  }
})

const redeem = async () => {
  if (status.value !== 'ready') return
  status.value = 'loading'
  try {
    await updateDoc(doc(db, 'accounts', uid), {
      phase: 'thanks'
    })
    status.value = 'success'
  } catch(e) {
    status.value = 'error'
    errorMsg.value = e.message
  }
}
</script>

<template>
  <div class="flex flex-col items-center gap-4 px-4 py-16 bg-[#7c6fe0] min-h-screen text-white text-center">
    <h1 class="text-3xl font-bold mb-8">Area Manager</h1>
    
    <div v-if="status === 'loading'">
      <p>Verifica in corso...</p>
    </div>

    <div v-else-if="status === 'not_ready'">
      <h2 class="text-2xl font-bold text-red-300">Attenzione</h2>
      <p class="mt-4">{{ errorMsg || "L'utente non ha ancora completato il quiz o non è in fase di redeem." }}</p>
    </div>

    <div v-else-if="status === 'redeemed'">
      <h2 class="text-2xl font-bold text-red-300">Cocktail Già Erogato</h2>
      <p class="mt-4">Questo premio è già stato ritirato.</p>
    </div>

    <div v-else-if="status === 'ready'">
      <h2 class="text-2xl font-bold text-green-300">Premio Valido!</h2>
      <p class="mt-4 mb-8">L'utente ha diritto a un cocktail omaggio.</p>
      <button
        type="button"
        class="scan-btn"
        @click="redeem"
      >
        Eroga Cocktail
      </button>
    </div>

    <div v-else-if="status === 'success'">
      <h2 class="text-2xl font-bold text-green-300">Erogazione Confermata!</h2>
      <p class="mt-4">Il cocktail è stato erogato con successo.</p>
      <button class="scan-btn mt-8" @click="$router.push('/')">Torna alla Home</button>
    </div>

    <div v-else-if="status === 'error'">
      <h2 class="text-2xl font-bold text-red-300">Errore</h2>
      <p class="mt-4">{{ errorMsg }}</p>
    </div>
  </div>
</template>
