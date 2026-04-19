<script setup>
import { onMounted, ref, inject, computed } from 'vue'

import { useRoute } from 'vue-router'
const route = useRoute()

import { CheckIcon, ExclamationCircleIcon } from '@heroicons/vue/24/solid'

import { useUtils } from '../composables/useUtils'
const utils = useUtils()

const global = inject('global')
const account = ref(null)

const targetUid = computed(() => route.params.uid)

function redeemedAtToDate(value) {
  if (value == null) return null
  if (typeof value.toDate === 'function') return value.toDate()
  const d = value instanceof Date ? value : new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

const redeemedAtLabel = computed(() => {
  const d = redeemedAtToDate(account.value?.redeemed_at)
  if (!d) return ''
  const datePart = new Intl.DateTimeFormat('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
  const timePart = new Intl.DateTimeFormat('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
  return `${datePart} alle ${timePart}`
})

const alreadyRedeemed = computed(() => redeemedAtToDate(account.value?.redeemed_at) != null)

const reloadTargetAccount = async () => {
  account.value = await utils.accountGet(targetUid.value)
}

const redeem = async () => {
  try {
    global.dialog = {
      text: 'Conferma consegna premio?',
      confirmText: 'Continua',
      onConfirm: async () => {
        await utils.accountUpdateByUid(targetUid.value, { redeemed_at: new Date() })
        await reloadTargetAccount()
      },
    }
  } catch (err) {
    console.error(err)
  }
}

const cancelRedeem = async () => {
  try {
    await utils.accountUpdateByUid(targetUid.value, { redeemed_at: null })
    await reloadTargetAccount()
  } catch (err) {
    console.error(err)
  }
}

onMounted(async () => {
  const uid = route.params.uid
  console.log('uid', uid)
  account.value = await utils.accountGet(uid)
})
</script>

<template>
  <div class="flex flex-col items-center gap-4 px-4 py-8">
    <template v-if="alreadyRedeemed">
      <div
        class="flex size-64 shrink-0 items-center justify-center"
        aria-hidden="true"
      >
        <ExclamationCircleIcon class="size-42 text-red-600" />
      </div>
      <p class="m-0 max-w-md text-center text-lg text-neutral-800">
        <template v-if="redeemedAtLabel">
          Premio già ritirato {{ redeemedAtLabel }}.
        </template>
        <template v-else>
          Premio già ritirato.
        </template>
      </p>
      <button
        v-if="utils.isAdmin()"
        type="button"
        class="btn btn-secondary"
        @click="cancelRedeem"
      >
        Annulla redeem
      </button>
    </template>
    <template v-else>
      <div
        class="flex size-64 shrink-0 items-center justify-center"
        aria-hidden="true"
      >
        <CheckIcon class="size-42 text-green-600" />
      </div>
      <button
        type="button"
        class="btn btn-primary"
        @click="redeem"
      >
        Consegna premio
      </button>
    </template>
  </div>
</template>
