<script setup>
import { inject, onMounted, ref, computed, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import Paginator from '../components/Paginator.vue'
import { useAdminGuard } from '../composables/useAdminGuard.js'
import { useUtils } from '../composables/useUtils'

useAdminGuard()

const global = inject('global')
const route = useRoute()
const router = useRouter()
const utils = useUtils()

const ACCOUNTS_PAGE_SIZE = 15

const accountsList = ref([])
const page = ref(1)
const searchQ = ref('')

const routeSearchQ = computed(() => {
  const raw = route.query.q
  const s = Array.isArray(raw) ? raw[0] : raw
  return typeof s === 'string' ? s : ''
})

const accountsPage = computed(() => {
  const list = accountsList.value
  const start = (page.value - 1) * ACCOUNTS_PAGE_SIZE
  return list.slice(start, start + ACCOUNTS_PAGE_SIZE)
})

async function loadAccounts() {
  const q = routeSearchQ.value
  searchQ.value = q
  accountsList.value = await utils.accountsSearch(q)
}

watch(
  () => route.query.q,
  async () => {
    page.value = 1
    await loadAccounts()
  },
  { immediate: true, flush: 'post' },
)

function onSearchSubmit() {
  const q = searchQ.value.trim()
  router.push({ name: 'admin_accounts', query: q ? { q } : {} })
}

function scannedCount(row) {
  return Array.isArray(row.qrcodes_scanned) ? row.qrcodes_scanned.length : 0
}

function validCount(row) {
  return Array.isArray(row.qrcodes) ? row.qrcodes.length : 0
}

function rowEmail(row) {
  if (typeof row.email === 'string' && row.email.trim()) return row.email.trim()
  return '—'
}

function escapeCsvCell(val) {
  const s = String(val ?? '')
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

async function exportFullCsv() {
  const all = await utils.accountsGet()
  const headers = ['uid', 'name', 'email', 'qrcode_scansionati', 'qrcode_validi']
  const rows = all.map((a) => [
    a.uid ?? '',
    utils.accountDisplayName(a),
    typeof a.email === 'string' ? a.email : '',
    Array.isArray(a.qrcodes_scanned) ? a.qrcodes_scanned.length : 0,
    Array.isArray(a.qrcodes) ? a.qrcodes.length : 0,
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

onMounted(() => {
  global.bgColor = '#ccc'
})
</script>

<template>
  <div class="mb-8 w-full min-w-0 max-w-full">
    <div class="mb-4 flex flex-wrap items-center justify-center gap-4">
      <RouterLink
        :to="{ name: 'admin_qrcodes_list' }"
        class="btn btn-secondary"
      >
        ← QR-code
      </RouterLink>
    </div>

    <section class="flex w-full min-w-0 max-w-full flex-col gap-4">
      <form
        class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        role="search"
        @submit.prevent="onSearchSubmit"
      >
        <label
          for="accounts-search"
          class="mb-2 block text-sm font-semibold text-slate-800"
        >
          Ricerca
        </label>
        <div class="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:gap-3">
          <input
            id="accounts-search"
            v-model="searchQ"
            name="q"
            type="search"
            autocomplete="off"
            placeholder="UID o nome (anche parziale)"
            class="w-full min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
          <div class="flex flex-wrap items-center gap-2 sm:shrink-0">
            <button
              type="submit"
              class="btn btn-primary"
            >
              Cerca
            </button>
            <RouterLink
              :to="{ name: 'admin_accounts' }"
              class="btn btn-secondary"
            >
              Reimposta
            </RouterLink>
          </div>
        </div>
      </form>

      <Paginator
        v-model="page"
        :total-items="accountsList.length"
        :page-size="ACCOUNTS_PAGE_SIZE"
      />

      <div
        class="w-full min-w-0 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm"
      >
        <table class="w-full min-w-0 table-auto border-collapse text-left text-base">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50">
              <th
                scope="col"
                class="w-[min(32%,20rem)] max-w-sm px-4 py-3 font-semibold text-slate-800"
              >
                UID
              </th>
              <th scope="col" class="min-w-0 px-4 py-3 font-semibold text-slate-800">
                Nome
              </th>
              <th scope="col" class="min-w-0 max-w-xs px-4 py-3 font-semibold text-slate-800">
                Email
              </th>
              <th
                scope="col"
                class="w-[1%] shrink-0 whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-800 tabular-nums"
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
              <td class="min-w-0 max-w-sm truncate px-4 py-3 font-mono text-sm text-slate-900" :title="row.uid">
                {{ row.uid }}
              </td>
              <td class="min-w-0 wrap-break-word px-4 py-3 text-slate-900">
                {{ utils.accountDisplayName(row) }}
              </td>
              <td class="min-w-0 max-w-xs truncate px-4 py-3 text-sm text-slate-900" :title="rowEmail(row)">
                {{ rowEmail(row) }}
              </td>
              <td class="w-[1%] shrink-0 whitespace-nowrap px-4 py-3 text-right tabular-nums text-slate-900">
                {{ scannedCount(row) }} / {{ validCount(row) }}
              </td>
            </tr>
            <tr v-if="!accountsList.length && !routeSearchQ">
              <td colspan="4" class="px-4 py-8 text-center text-slate-600">
                Nessun account.
              </td>
            </tr>
            <tr v-else-if="!accountsList.length && routeSearchQ">
              <td colspan="4" class="px-4 py-8 text-center text-slate-600">
                Nessun risultato per «{{ routeSearchQ }}».
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
          :disabled="!routeSearchQ && !accountsList.length"
          @click="exportFullCsv"
        >
          Esporta CSV (lista completa)
        </button>
      </div>
    </section>
  </div>
</template>
