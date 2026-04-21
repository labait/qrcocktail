<script setup>
import { inject, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'

import Qrcode from '../components/Qrcode.vue'
import RedeemStatus from '../components/RedeemStatus.vue'

import { useAdminGuard } from '../composables/useAdminGuard.js'
import { qrcodesGet } from '../composables/useUtils'
useAdminGuard()

const global = inject('global')
const reloadQrCodes = inject('reloadQrCodes', async () => {})

const qrList = ref([])

async function refreshQrList() {
  qrList.value = await qrcodesGet()
}

onMounted(async () => {
  await refreshQrList()
  await reloadQrCodes()
  global.bgColor = '#ccc'
})

async function removeRow(id) {
  if (!id) return
  if (!window.confirm('Eliminare questo QR-code? Operazione non è reversibile.')) return
  try {
    await deleteDoc(doc(db, 'qrcodes', id))
    await refreshQrList()
    await reloadQrCodes()
  } catch (err) {
    console.error(err)
    window.alert('Eliminazione non riuscita.')
  }
}
</script>

<template>
  <div class="mx-auto ">
    <RedeemStatus class="text-white text-xl mb-8 text-center" />
    <div class="mb-4 flex justify-center">
      <RouterLink
        :to="{ name: 'admin_qrcodes_new' }"
        class="btn btn-primary"
      >
        + Nuovo
      </RouterLink>
    </div>

    <section class="">

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="row in qrList"
          :key="row.id"
          class="flex flex-col gap-2 items-center bg-white p-4 rounded-lg border border-slate-200"
        >
          <RouterLink :to="{ name: 'admin_qrcodes_edit', params: { id: row.id } }">
          <Qrcode v-if="row.code" :url="`/qcodes/${row.code}`" />
          </RouterLink>

          <div>
            {{ row.name ?? '—' }}
          </div>

          <div
            class="text-sm"
            :class="row.enabled === false ? 'text-amber-700' : 'text-emerald-700'"
          >
            {{ row.enabled === false ? 'Disattivato' : 'Attivo' }}
          </div>

          <div>
            <RouterLink
              v-if="row.code"
              :to="{ name: 'qrcode', params: { code: String(row.code) } }"
              class="underline-offset-2 hover:underline text-black"
            >
              {{ row.code }}
            </RouterLink>
            <span v-else class="">—</span>
          </div>
          <div class="md:text-right">
            <RouterLink
              v-if="row.id"
              :to="{ name: 'admin_qrcodes_edit', params: { id: row.id } }"
              class="mr-3 text-baseunderline-offset-2 hover:underline text-black"
            >
              Modifica
            </RouterLink>
            <a
              v-if="row.id"
              href="#"
              class="text-base text-red-600 underline-offset-2 hover:underline"
              @click.prevent="removeRow(row.id)"
            >
              Elimina
            </a>
          </div>
        </div>

        <div v-if="!qrList.length" class="py-8 text-center text-base">
          Nessun QR-code. Aggiungine uno con «+ Nuovo».
        </div>
      </div>
    </section>
  </div>
</template>