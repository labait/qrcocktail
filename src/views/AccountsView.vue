<script setup>
import { inject, onMounted, ref, computed, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import Paginator from '../components/Paginator.vue'
import { useAdminGuard } from '../composables/useAdminGuard.js'
import { useUtils } from '../composables/useUtils'
import { redeemedAtToDate } from '../utils/accountRedeem.js'

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

function qrcodeNameForCode(code) {
  const def = global.qrcodes?.find((q) => String(q.code) === String(code))
  if (def && typeof def.name === 'string' && def.name.trim()) return def.name.trim()
  return String(code)
}

/** Da `account.qrcodes` (codici validi): map → `name` dal catalogo, `Set` univoco, join con `, ` */
function qrcodesNamesUniqueJoin(row) {
  if (!Array.isArray(row?.qrcodes) || !row.qrcodes.length) return ''
  const names = row.qrcodes.map((code) => qrcodeNameForCode(code))
  return [...new Set(names)].join(', ')
}

function qrcodesCount(row) {
  return Array.isArray(row.qrcodes_scanned) ? row.qrcodes_scanned.length : 0
}

function qrcodesUniq(row) {
  return Array.isArray(row.qrcodes) ? row.qrcodes.length : 0
}

function rowEmail(row) {
  if (typeof row.email === 'string' && row.email.trim()) return row.email.trim()
  return '—'
}

function rowRedeemedAtDisplay(row) {
  const d = redeemedAtToDate(row?.redeemed_at)
  if (!d) return '—'
  return d.toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' })
}

function rowRedeemedAtCsv(row) {
  const d = redeemedAtToDate(row?.redeemed_at)
  return d ? d.toISOString() : ''
}

/** Larghezza colonne (fr) in desktop: stesso su header e righe */
const accountGridClass =
  'md:grid md:grid-cols-[1fr_1.1fr_1.1fr_1.5fr_0.4fr_0.4fr_0.7fr] md:items-center md:gap-3'

function escapeCsvCell(val) {
  const s = String(val ?? '')
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

async function exportFullCsv() {
  const all = await utils.accountsGet()
  const headers = [
    'uid',
    'name',
    'email',
    'qrcodes_names',
    'qrcodes_count',
    'qrcodes_uniq',
    'redeemed_at',
  ]
  const rows = all.map((a) => [
    a.uid ?? '',
    utils.accountDisplayName(a),
    typeof a.email === 'string' ? a.email : '',
    qrcodesNamesUniqueJoin(a),
    qrcodesCount(a),
    qrcodesUniq(a),
    rowRedeemedAtCsv(a),
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
        class="w-full min-w-0 overflow-x-auto rounded-sm shadow-sm"
      >
        <div
          v-if="!accountsList.length && !routeSearchQ"
          class="px-4 py-8 text-center text-slate-600"
        >
          Nessun account.
        </div>
        <div
          v-else-if="!accountsList.length && routeSearchQ"
          class="px-4 py-8 text-center text-slate-600"
        >
          Nessun risultato per «{{ routeSearchQ }}».
        </div>

        <div v-else class="min-w-0 p-0">
          <!-- Riga header: solo >= md, colonne in fr (come le righe dati) -->
          <div
            class="hidden border-b border-slate-200 bg-slate-50 px-2 py-2.5 text-sm font-semibold text-slate-800"
            :class="accountGridClass"
          >
            <div class="min-w-0">UID</div>
            <div class="min-w-0">Name</div>
            <div class="min-w-0">Email</div>
            <div class="min-w-0">QRCodes</div>
            <div class="min-w-0 text-right">Count</div>
            <div class="min-w-0 text-right">Uniq</div>
            <div class="min-w-0 text-right">RedeemedAt</div>
          </div>

          <div
            v-for="row in accountsPage"
            :key="row.uid"
            class="border-b border-slate-100 last:border-b-0 mb-2 md:mb-0 bg-white"
          >
            <!-- < md, sm: etichetta + valore a colonna -->
            <div class="p-3 md:hidden">
              <dl class="space-y-2.5">
                <div>
                  <dt class="text-xs font-semibold text-slate-500">
                    UID
                  </dt>
                  <dd class="min-w-0 break-all font-mono text-sm text-slate-900">
                    {{ row.uid }}
                  </dd>
                </div>
                <div>
                  <dt class="text-xs font-semibold text-slate-500">
                    Name
                  </dt>
                  <dd class="min-w-0 wrap-break-word text-slate-900">
                    {{ utils.accountDisplayName(row) }}
                  </dd>
                </div>
                <div>
                  <dt class="text-xs font-semibold text-slate-500">
                    Email
                  </dt>
                  <dd class="min-w-0 wrap-break-word text-sm text-slate-900">
                    {{ rowEmail(row) }}
                  </dd>
                </div>
                <div>
                  <dt class="text-xs font-semibold text-slate-500">
                    QRCodes
                  </dt>
                  <dd class="min-w-0 wrap-break-word text-sm text-slate-900">
                    {{ qrcodesNamesUniqueJoin(row) || '—' }}
                  </dd>
                </div>
                <div>
                  <dt class="text-xs font-semibold text-slate-500">
                    Count
                  </dt>
                  <dd class="tabular-nums text-slate-900">
                    {{ qrcodesCount(row) }}
                  </dd>
                </div>
                <div>
                  <dt class="text-xs font-semibold text-slate-500">
                    Uniq
                  </dt>
                  <dd class="tabular-nums text-slate-900">
                    {{ qrcodesUniq(row) }}
                  </dd>
                </div>
                <div>
                  <dt class="text-xs font-semibold text-slate-500">
                    RedeemedAt
                  </dt>
                  <dd class="text-sm text-slate-900">
                    {{ rowRedeemedAtDisplay(row) }}
                  </dd>
                </div>
              </dl>
            </div>

            <!-- >= md: griglia a una riga, stessi tracciati fr dell’header -->
            <div
              class="hidden px-2 py-3"
              :class="accountGridClass"
            >
              <div
                class="min-w-0 truncate font-mono text-sm text-slate-900"
                :title="row.uid"
              >
                {{ row.uid }}
              </div>
              <div class="min-w-0 wrap-break-word text-slate-900">
                {{ utils.accountDisplayName(row) }}
              </div>
              <div
                class="min-w-0 truncate text-sm text-slate-900"
                :title="rowEmail(row) === '—' ? undefined : rowEmail(row)"
              >
                {{ rowEmail(row) }}
              </div>
              <div
                class="min-w-0 wrap-break-word text-sm text-slate-900"
                :title="qrcodesNamesUniqueJoin(row) || undefined"
              >
                {{ qrcodesNamesUniqueJoin(row) || '—' }}
              </div>
              <div class="min-w-0 text-right tabular-nums text-slate-900">
                {{ qrcodesCount(row) }}
              </div>
              <div class="min-w-0 text-right tabular-nums text-slate-900">
                {{ qrcodesUniq(row) }}
              </div>
              <div
                class="min-w-0 text-right text-sm text-slate-900"
                :title="rowRedeemedAtDisplay(row) === '—' ? undefined : rowRedeemedAtDisplay(row)"
              >
                {{ rowRedeemedAtDisplay(row) }}
              </div>
            </div>
          </div>
        </div>
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
