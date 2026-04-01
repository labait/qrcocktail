<script setup>
import { inject, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import Qrcode from '../components/qrcode.vue'
import { useAdminGuard } from '../composables/useAdminGuard.js'

useAdminGuard()

const global = inject('global')
const reloadQrCodes = inject('reloadQrCodes', async () => {})

onMounted(() => {
  reloadQrCodes()
})

async function removeRow(id) {
  if (!id) return
  if (!window.confirm('Eliminare questo QR code? L’operazione non è reversibile.')) return
  try {
    await deleteDoc(doc(db, 'qrcodes', id))
    await reloadQrCodes()
  } catch (err) {
    console.error(err)
    window.alert('Eliminazione non riuscita.')
  }
}
</script>

<template>
  <div class="w-full max-w-4xl px-4 py-6">
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-semibold text-slate-900">Amministrazione QR code</h1>
      <RouterLink
        :to="{ name: 'qrcodes_new' }"
        class="rounded-lg bg-slate-900 px-4 py-2 text-base font-medium text-white hover:bg-slate-800"
      >
        new qrcode
      </RouterLink>
    </div>

    <div class="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
      <table class="min-w-full divide-y divide-slate-200 text-left text-base">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-4 py-3 font-medium text-slate-700">QR</th>
            <th class="px-4 py-3 font-medium text-slate-700">Nome</th>
            <th class="px-4 py-3 font-medium text-slate-700">Codice</th>
            <th class="px-4 py-3 font-medium text-slate-700 text-right">Azioni</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white">
          <tr v-for="row in global.qrcodes" :key="row.id">
            <td class="px-4 py-3 align-middle">
              <Qrcode
                v-if="row.code"
                :path="`/qcodes/${row.code}`"
                :size="56"
              />
            </td>
            <td class="px-4 py-3 align-middle text-slate-800">
              {{ row.name ?? '—' }}
            </td>
            <td class="px-4 py-3 align-middle">
              <RouterLink
                v-if="row.code"
                :to="{ name: 'qrcode_by_code', params: { code: String(row.code) } }"
                class="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-800"
              >
                {{ row.code }}
              </RouterLink>
              <span v-else class="text-slate-400">—</span>
            </td>
            <td class="px-4 py-3 align-middle text-right">
              <RouterLink
                v-if="row.id"
                :to="{ name: 'qrcodes_edit', params: { id: row.id } }"
                class="mr-3 text-blue-600 underline underline-offset-2 hover:text-blue-800"
              >
                Modifica
              </RouterLink>
              <button
                v-if="row.id"
                type="button"
                class="text-red-600 underline underline-offset-2 hover:text-red-800"
                @click="removeRow(row.id)"
              >
                Elimina
              </button>
            </td>
          </tr>
          <tr v-if="!global.qrcodes.length">
            <td colspan="4" class="px-4 py-8 text-center text-slate-500">
              Nessun QR code. Aggiungine uno con «new qrcode».
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
