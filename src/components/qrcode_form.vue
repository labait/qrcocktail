<script setup>
import { inject, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

const props = defineProps({
  mode: {
    type: String,
    required: true,
    validator: (v) => v === 'create' || v === 'edit',
  },
  documentId: {
    type: String,
    default: null,
  },
})

const global = inject('global')
const reloadQrCodes = inject('reloadQrCodes', async () => {})

const router = useRouter()
const name = ref('')
const code = ref('')
const isSaving = ref(false)
const isLoadingDoc = ref(false)
const loadError = ref('')

function isCodeTakenByOther(candidate, excludeDocumentId) {
  const c = String(candidate)
  return global.qrcodes.some(
    (q) => q.id !== excludeDocumentId && String(q.code) === c,
  )
}

async function submit() {
  loadError.value = ''
  const trimmed = name.value.trim()
  if (!trimmed) {
    loadError.value = 'Inserisci un nome.'
    return
  }

  const codeTrimmed = code.value.trim()
  if (!codeTrimmed) {
    loadError.value = 'Inserisci un codice.'
    return
  }

  if (isCodeTakenByOther(codeTrimmed, props.documentId)) {
    loadError.value = 'Questo codice è già in uso.'
    return
  }

  isSaving.value = true
  try {
    if (props.mode === 'create') {
      await addDoc(collection(db, 'qrcodes'), {
        name: trimmed,
        code: codeTrimmed,
      })
    } else if (props.documentId) {
      await updateDoc(doc(db, 'qrcodes', props.documentId), {
        name: trimmed,
        code: codeTrimmed,
      })
    }
    await reloadQrCodes()
    router.push({ name: 'qrcodes_admin' })
  } catch (err) {
    console.error(err)
    loadError.value = 'Salvataggio non riuscito.'
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  if (props.mode !== 'edit' || !props.documentId) return
  isLoadingDoc.value = true
  try {
    const snap = await getDoc(doc(db, 'qrcodes', props.documentId))
    if (snap.exists()) {
      const data = snap.data()
      name.value = data.name != null ? String(data.name) : ''
      code.value = data.code != null ? String(data.code) : ''
    } else {
      loadError.value = 'Documento non trovato.'
    }
  } catch (err) {
    console.error(err)
    loadError.value = 'Impossibile caricare il QR code.'
  } finally {
    isLoadingDoc.value = false
  }
})
</script>

<template>
  <div class="w-full max-w-md space-y-4 px-4 py-6">
    <h1 class="text-xl font-semibold text-slate-900">
      {{ mode === 'create' ? 'Nuovo QR code' : 'Modifica QR code' }}
    </h1>

    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label for="qrcode-name" class="mb-1 block text-base font-medium text-slate-700">Nome</label>
        <input
          id="qrcode-name"
          v-model="name"
          type="text"
          autocomplete="off"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          :disabled="isSaving || isLoadingDoc"
        />
      </div>

      <div>
        <label for="qrcode-code" class="mb-1 block text-base font-medium text-slate-700">Codice</label>
        <input
          id="qrcode-code"
          v-model="code"
          type="text"
          autocomplete="off"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          :disabled="isSaving || isLoadingDoc"
        />
      </div>

      <p v-if="loadError" class="text-base text-red-600">{{ loadError }}</p>

      <div class="flex gap-3">
        <button
          type="submit"
          class="rounded-lg bg-slate-900 px-4 py-2 text-base font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          :disabled="isSaving || isLoadingDoc"
        >
          Salva
        </button>
        <RouterLink
          :to="{ name: 'qrcodes_admin' }"
          class="rounded-lg border border-slate-300 px-4 py-2 text-base font-medium text-slate-700 hover:bg-slate-50"
        >
          Annulla
        </RouterLink>
      </div>
    </form>
  </div>
</template>
