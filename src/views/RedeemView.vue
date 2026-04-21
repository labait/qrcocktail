<script setup>
import { onMounted, ref, inject, computed, watch } from 'vue'

import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()

import { CheckIcon, ExclamationCircleIcon, XMarkIcon } from '@heroicons/vue/24/solid'

import { where } from 'firebase/firestore'

import { useUtils } from '../composables/useUtils'
import { redeemedAtToDate } from '../utils/accountRedeem'
import RedeemStatus from '../components/RedeemStatus.vue'

const utils = useUtils()

const global = inject('global')
const account = ref(null)

const targetUid = computed(() => route.params.uid)

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

const redeemCapReached = ref(false)

const reloadTargetAccount = async () => {
  account.value = await utils.accountGet(targetUid.value)
}

const redeem = async () => {
  try {
    global.dialog = {
      text: 'Conferma consegna premio?',
      confirmText: 'Continua',
      onConfirm: async () => {
        await utils.accountUpdateByUid(targetUid.value, {
          redeemed_at: new Date(),
          phase: 'thankyou',
        })
        await reloadTargetAccount()
      },
    }
  } catch (err) {
    console.error(err)
  }
}

const cancelRedeem = async () => {
  try {
    await utils.accountUpdateByUid(targetUid.value, {
      redeemed_at: null,
      phase: 'quiz',
    })
    await reloadTargetAccount()
  } catch (err) {
    console.error(err)
  }
}

onMounted(async () => {
  global.bgColor = '#aaa'
  const uid = route.params.uid
  console.log('uid', uid)
  account.value = await utils.accountGet(uid)

  const redeemedAccounts = await utils.accountsGet({
    query: [where('redeemed_at', '!=', null)],
  })
  const maxRedeems = global.settings.redeem.max
  if (redeemedAccounts.length >= maxRedeems) {
    redeemCapReached.value = true
    global.dialog = {
      text: `Numero massimo di premi consegnato`,
      confirmText: 'Continua',
    }
  }
})

// check if the account is a redeemer
watch(global, (newVal) => {
  if(newVal.account) {
    if(!utils.isRedeemer()) {
      router.push({ name: 'home' })
    }
  }
}, { immediate: true })
</script>

<template v-if="account">
  <div v-if="utils.isRedeemer()" class="flex flex-col items-center gap-4 px-4 py-8">
    <RedeemStatus class="text-white text-2xl mb-8 " />
    <template v-if="alreadyRedeemed">
      <div class="flex size-64 shrink-0 items-center justify-center" aria-hidden="true">
        <ExclamationCircleIcon class="size-42 text-red-600" />
      </div>
      <p class="m-0 max-w-md text-center text-white text-2xl">
        Premio già ritirato {{ redeemedAtLabel }}.
      </p>
    </template>

    <template v-else-if="!utils.accountCanRedeem(account)">
      <div class="flex rounded-full bg-red-600 size-64 shrink-0 items-center justify-center" aria-hidden="true">
        <XMarkIcon class="size-42 text-white" />
      </div>
      <p class="m-0 max-w-md text-center text-white text-2xl">
        L'utente non ha diritto al premio.
      </p>
    </template>

    <template v-else>
      <div class="flex rounded-full bg-green-600 size-64 shrink-0 items-center justify-center" aria-hidden="true">
        <CheckIcon class="size-42 text-white" />
      </div>
      <button
        v-if="!redeemCapReached"
        type="button"
        class="btn btn-secondary"
        @click="redeem"
      >
        Consegna premio
      </button>
    </template>
    <button
        v-if="utils.isAdmin()"
        type="button"
        class="btn btn-secondary"
        @click="cancelRedeem"
      >
        Annulla redeem
      </button>
  </div>
</template>
