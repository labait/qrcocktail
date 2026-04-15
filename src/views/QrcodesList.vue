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
  if (!window.confirm('Eliminare questo QR code? Operazione non è reversibile.')) return
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
  <div class="admin-root">

    <!-- Header viola admin -->
    <section class="admin-hero">
      <img src="../assets/Laba-logo.svg" class="logo-laba" alt="LABA Logo" />
      <div class="admin-hero-row">
        <h1 class="admin-hero-title">Console QR</h1>
        <RouterLink :to="{ name: 'qrcodes_new' }" class="admin-new-btn">
          + Nuovo
        </RouterLink>
      </div>
    </section>

    <!-- Lista QR -->
    <section class="admin-body">
      <div class="qr-table-wrapper">
        <table class="qr-table">
          <thead>
            <tr>
              <th>Grafica</th>
              <th>Nome</th>
              <th>ID</th>
              <th class="text-right">Azioni</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in global.qrcodes" :key="row.id" class="qr-row">
              <td class="qr-cell">
                <Qrcode v-if="row.code" :path="`/qcodes/${row.code}`" :size="52" />
              </td>
              <td class="qr-cell qr-name">{{ row.name ?? '—' }}</td>
              <td class="qr-cell">
                <RouterLink
                  v-if="row.code"
                  :to="{ name: 'qrcode_by_code', params: { code: String(row.code) } }"
                  class="qr-link"
                >
                  {{ row.code }}
                </RouterLink>
                <span v-else class="qr-empty">—</span>
              </td>
              <td class="qr-cell text-right">
                <RouterLink
                  v-if="row.id"
                  :to="{ name: 'qrcodes_edit', params: { id: row.id } }"
                  class="qr-action-edit"
                >
                  Modifica
                </RouterLink>
                <button
                  v-if="row.id"
                  type="button"
                  class="qr-action-delete"
                  @click="removeRow(row.id)"
                >
                  Elimina
                </button>
              </td>
            </tr>
            <tr v-if="!global.qrcodes.length">
              <td colspan="4" class="qr-empty-row">
                Nessun QR code. Aggiungine uno con «+ Nuovo».
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

  </div>
</template>