<script setup>
import { inject, onMounted, ref, computed } from 'vue'
import { RouterLink } from 'vue-router'

import Paginator from '../components/Paginator.vue'
import { useAdminGuard } from '../composables/useAdminGuard.js'
import { useUtils } from '../composables/useUtils'

useAdminGuard()

const global = inject('global')
const utils = useUtils()

const ACCOUNTS_PAGE_SIZE = 15

const accountsList = ref([])
const page = ref(1)

const accountsPage = computed(() => {
  const start = (page.value - 1) * ACCOUNTS_PAGE_SIZE
  return accountsList.value.slice(start, start + ACCOUNTS_PAGE_SIZE)
})

function accountDisplayName(row) {
  if (typeof row.name === 'string' && row.name.trim()) return row.name.trim()
  const fn = typeof row.firstname === 'string' ? row.firstname.trim() : ''
  const ln = typeof row.lastname === 'string' ? row.lastname.trim() : ''
  if (fn || ln) return [fn, ln].filter(Boolean).join(' ')
  if (typeof row.email === 'string' && row.email.trim()) return row.email.trim()
  return '—'
}

function scannedCount(row) {
  return Array.isArray(row.qrcodes_scanned) ? row.qrcodes_scanned.length : 0
}

function validCount(row) {
  return Array.isArray(row.qrcodes) ? row.qrcodes.length : 0
}

function escapeCsvCell(val) {
  const s = String(val ?? '')
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function exportFullCsv() {
  const headers = ['uid', 'name', 'qrcode_scansionati', 'qrcode_validi']
  const rows = accountsList.value.map((a) => [
    a.uid ?? '',
    accountDisplayName(a),
    scannedCount(a),
    validCount(a),
  ])
  const lines = [headers, ...rows].map((r) =>
    r.map(escapeCsvCell).join(','),
  )
  const blob = new Blob([`\uFEFF${lines.join('\n')}`], {
    type: 'text/csv;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `accounts-${new Date().toISOString().slice(0, 10)}.csv`
  a.rel = 'noopener'
  a.click()
  URL.revokeObjectURL(url)
}

async function refreshAccounts() {
  accountsList.value = await utils.accountsGet()
}

onMounted(async () => {
  global.bgColor = '#ccc'
  await refreshAccounts()
})
</script>

<template>
  <div class="mx-auto mb-8 px-2">
    <div class="mb-4 flex flex-wrap items-center justify-center gap-4">
      <RouterLink
        :to="{ name: 'admin_qrcodes_list' }"
        class="btn btn-secondary"
      >
        ← QR-code
      </RouterLink>
    </div>

    <section class="flex flex-col gap-4">
      <Paginator
        v-model="page"
        :total-items="accountsList.length"
        :page-size="ACCOUNTS_PAGE_SIZE"
      />

      <div
        class="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm"
      >
        <table class="w-full min-w-[36rem] border-collapse text-left text-base">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50">
              <th scope="col" class="px-4 py-3 font-semibold text-slate-800">
                UID
              </th>
              <th scope="col" class="px-4 py-3 font-semibold text-slate-800">
                Nome
              </th>
              <th
                scope="col"
                class="px-4 py-3 text-right font-semibold text-slate-800 tabular-nums"
              >
                QR scansionati / validi
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in accountsPage"
              :key="row.uid"
              class="border-b border-slate-100 last:border-b-0"
            >
              <td class="max-w-[12rem] truncate px-4 py-3 font-mono text-sm text-slate-900" :title="row.uid">
                {{ row.uid }}
              </td>
              <td class="px-4 py-3 text-slate-900">
                {{ accountDisplayName(row) }}
              </td>
              <td class="px-4 py-3 text-right tabular-nums text-slate-900">
                {{ scannedCount(row) }} / {{ validCount(row) }}
              </td>
            </tr>
            <tr v-if="!accountsList.length">
              <td colspan="3" class="px-4 py-8 text-center text-slate-600">
                Nessun account.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Paginator
        v-model="page"
        :total-items="accountsList.length"
        :page-size="ACCOUNTS_PAGE_SIZE"
      />

      <div class="flex justify-center pt-2">
        <button
          type="button"
          class="btn btn-primary"
          :disabled="!accountsList.length"
          @click="exportFullCsv"
        >
          Esporta CSV (lista completa)
        </button>
      </div>
    </section>
  </div>
</template>
