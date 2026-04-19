import { inject } from 'vue'
import { useRouter } from 'vue-router'
import { updateDoc, doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'

export function useUtils() {
  const global = inject('global')
  const router = useRouter()
  const base_url = import.meta.env.VITE_BASE_URL

  const getAbsoluteUrl = (path) => {
    return `${base_url}${path}`
  }

  const isAdmin = () => global.account && Array.isArray(global.account.roles) && global.account.roles.includes('admin')

  const isManager = () => global.account && Array.isArray(global.account.roles) && (global.account.roles.includes('manager') || global.account.roles.includes('admin'))
  
  const setPhase = async (phase) => {
    if (!global.account) {
      console.error('Account not found')
      return
    }
    global.account.phase = phase
    await updateDoc(doc(db, 'accounts', global.account.uid), {
      phase: phase,
    })
    redirectToPhase(phase)
  }


  const redirectToPhase = (phase) => {
    if (!phase) phase = global.account?.phase ?? 'home'
    // keep debug param
    const debug = new URLSearchParams(window.location.search).has('debug')
    if (debug) {
      router.push({ name: phase, query: { debug: debug } })
    } else {
      router.push({ name: phase })
    } 
  }

  const reset = async () => {
    global.account.qrcodes = []
    await updateDoc(doc(db, 'accounts', global.account.uid), {
      qrcodes: [],
      questionsAnswered: [],
      redeemed_at: null,
      phase: 'qrcodes',
    })
    redirectToPhase()
  }

  const accountGet = async (uid) => {
    const snap = await getDoc(doc(db, 'accounts', uid))
    if (!snap.exists()) {
      console.error('Account not found')
      return null
    }
    return snap.data()
  }

  const accountUpdate = async (data) => {
    await updateDoc(doc(db, 'accounts', global.account.uid), data)
    global.account = {
      ...global.account,
      ...data,
    }
  }

  const accountUpdateByUid = async (uid, data) => {
    if (!uid) {
      console.error('accountUpdateByUid: uid mancante')
      return
    }
    await updateDoc(doc(db, 'accounts', uid), data)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    global.dialog = {
      text: 'URL copiato nella clipboard',
      confirmText: 'Continua',
      onConfirm: () => {
        global.dialog = null
      },
    }
  }
  

  return {
    isAdmin,
    isManager,
    copyToClipboard,
    getAbsoluteUrl,
    accountGet,
    accountUpdate,
    accountUpdateByUid,
    setPhase,
    redirectToPhase,
    reset,
  }
}


