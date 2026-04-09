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
  <div class="w-full">
    <!-- Admin Header Block -->
    <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-900 p-6 rounded-2xl shadow-xl border-b-4 border-brand">
      <h1 class="text-xl font-black tracking-widest uppercase text-white">
        Console <span class="text-brand">QR</span>
      </h1>
      <RouterLink
        :to="{ name: 'qrcodes_new' }"
        class="rounded-full bg-brand px-6 py-3 text-xs font-bold uppercase tracking-widest text-white hover:opacity-90 transition shadow-md whitespace-nowrap text-center"
      >
        + Nuovo Codice
      </RouterLink>
    </div>

    <!-- Data Table -->
    <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table class="min-w-full divide-y divide-slate-100 text-left text-sm">
        <thead class="bg-slate-50 uppercase tracking-widest text-[10px] font-black text-slate-500">
          <tr>
            <th class="px-5 py-4">Grafica</th>
            <th class="px-5 py-4">Nome</th>
            <th class="px-5 py-4">ID</th>
            <th class="px-5 py-4 text-right">Amministra</th>
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
                class="font-medium text-orange-600 underline underline-offset-2 hover:text-orange-800"
              >
                {{ row.code }}
              </RouterLink>
              <span v-else class="text-slate-400">—</span>
            </td>
            <td class="px-4 py-3 align-middle text-right">
              <RouterLink
                v-if="row.id"
                :to="{ name: 'qrcodes_edit', params: { id: row.id } }"
                class="mr-3 text-orange-600 underline underline-offset-2 hover:text-orange-800"
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