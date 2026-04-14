<script setup>
import { inject, ref } from 'vue'
import { useRouter } from 'vue-router'
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
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
  if (!trimmed) { loadError.value = 'Inserisci un nome.'; return }

  const codeTrimmed = code.value.trim()
  if (!codeTrimmed) { loadError.value = 'Inserisci un codice.'; return }

  if (isCodeTakenByOther(codeTrimmed, props.documentId)) {
    loadError.value = 'Questo codice è già in uso.'
    return
  }

  isSaving.value = true
  try {
    if (props.mode === 'create') {
      await addDoc(collection(db, 'qrcodes'), { name: trimmed, code: codeTrimmed })
    } else if (props.documentId) {
      await updateDoc(doc(db, 'qrcodes', props.documentId), { name: trimmed, code: codeTrimmed })
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
  <div class="form-root">

    <!-- Header viola con logo -->
    <section class="form-header">
      <img src="../assets/Laba-logo.svg" class="logo-laba" alt="LABA Logo" />
      <h1 class="form-title">
        {{ mode === 'create' ? 'Nuovo QR Code' : 'Modifica QR Code' }}
      </h1>
    </section>

    <!-- Form body -->
    <section class="form-body">
      <form class="form-fields" @submit.prevent="submit">

        <div class="field-group">
          <label for="qrcode-name" class="field-label">Nome</label>
          <input
            id="qrcode-name"
            v-model="name"
            type="text"
            autocomplete="off"
            class="field-input"
            :disabled="isSaving || isLoadingDoc"
            placeholder="Es. Bancone Nord"
          />
        </div>

        <div class="field-group">
          <label for="qrcode-code" class="field-label">Codice</label>
          <input
            id="qrcode-code"
            v-model="code"
            type="text"
            autocomplete="off"
            class="field-input"
            :disabled="isSaving || isLoadingDoc"
            placeholder="Es. ABC123"
          />
        </div>

        <p v-if="loadError" class="form-error">{{ loadError }}</p>

        <div class="form-actions">
          <button
            type="submit"
            class="form-submit"
            :disabled="isSaving || isLoadingDoc"
          >
            {{ isSaving ? 'Salvataggio…' : 'Salva' }}
          </button>
          <RouterLink :to="{ name: 'qrcodes_admin' }" class="form-cancel">
            Annulla
          </RouterLink>
        </div>

      </form>
    </section>

  </div>
</template>