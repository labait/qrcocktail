<script setup>
import { inject, ref } from 'vue'
import { useRouter } from 'vue-router'
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { qrcodesGet } from '../composables/useUtils'
import { RouterLink } from 'vue-router'
import { onMounted } from 'vue'

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

const reloadQrCodes = inject('reloadQrCodes', async () => {})

const router = useRouter()
const name = ref('')
const code = ref('')
const enabled = ref(true)
const isSaving = ref(false)
const isLoadingDoc = ref(false)
const loadError = ref('')

async function isCodeTakenByOther(candidate, excludeDocumentId) {
  const c = String(candidate)
  const all = await qrcodesGet()
  return all.some(
    (q) => q.id !== excludeDocumentId && String(q.code) === c,
  )
}

async function submit() {
  loadError.value = ''
  const trimmed = name.value.trim()
  if (!trimmed) { loadError.value = 'Inserisci un nome.'; return }

  const codeTrimmed = code.value.trim()
  if (!codeTrimmed) { loadError.value = 'Inserisci un codice.'; return }

  if (await isCodeTakenByOther(codeTrimmed, props.documentId)) {
    loadError.value = 'Questo codice è già in uso.'
    return
  }

  isSaving.value = true
  try {
    if (props.mode === 'create') {
      await addDoc(collection(db, 'qrcodes'), {
        name: trimmed,
        code: codeTrimmed,
        enabled: enabled.value,
      })
    } else if (props.documentId) {
      await updateDoc(doc(db, 'qrcodes', props.documentId), {
        name: trimmed,
        code: codeTrimmed,
        enabled: enabled.value,
      })
    }
    await reloadQrCodes()
    router.push({ name: 'admin_qrcodes_list' })
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
      enabled.value = data.enabled !== false
    } else {
      loadError.value = 'Documento non trovato.'
    }
  } catch (err) {
    console.error(err)
    loadError.value = 'Impossibile caricare il QR-code.'
  } finally {
    isLoadingDoc.value = false
  }
})
</script>

<template>
  <div class="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
    <section class="mb-4">
      <h1 class="text-2xl font-semibold text-slate-900">
        {{ mode === 'create' ? 'Nuovo QR-Code' : 'Modifica QR-Code' }}
      </h1>
    </section>

    <section class="bg-white p-4 shadow-sm">
      <form class="grid gap-4" @submit.prevent="submit">
        <div class="grid gap-2">
          <label for="qrcode-name" class="text-base font-medium text-slate-700">Nome</label>
          <input
            id="qrcode-name"
            v-model="name"
            type="text"
            autocomplete="off"
            class="w-full border border-slate-300 px-3 py-2 text-base text-slate-900 outline-none transition focus:border-indigo-500"
            :disabled="isSaving || isLoadingDoc"
            placeholder="Es. Bancone Nord"
          />
        </div>

        <div class="grid gap-2">
          <label for="qrcode-code" class="text-base font-medium text-slate-700">Codice</label>
          <input
            id="qrcode-code"
            v-model="code"
            type="text"
            autocomplete="off"
            class="w-full border border-slate-300 px-3 py-2 text-base text-slate-900 outline-none transition focus:border-indigo-500"
            :disabled="isSaving || isLoadingDoc"
            placeholder="Es. ABC123"
          />
        </div>

        <div class="flex items-center gap-3">
          <input
            id="qrcode-enabled"
            v-model="enabled"
            type="checkbox"
            class="size-4 border border-slate-300 text-indigo-600 focus:ring-indigo-500"
            :disabled="isSaving || isLoadingDoc"
          />
          <label for="qrcode-enabled" class="text-base text-slate-700">
            Attivo (visibile per la scansione pubblica)
          </label>
        </div>

        <p v-if="loadError" class="text-base text-red-600">{{ loadError }}</p>

        <div class="flex items-center gap-3 pt-2">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isSaving || isLoadingDoc"
          >
            {{ isSaving ? 'Salvataggio…' : 'Salva' }}
          </button>
          <RouterLink
            :to="{ name: 'admin_qrcodes_list' }"
            class="text-base text-slate-600 underline-offset-2 hover:underline"
          >
            Annulla
          </RouterLink>
        </div>
      </form>
    </section>
  </div>
</template>