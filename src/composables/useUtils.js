import { inject } from 'vue'
import { useRouter } from 'vue-router'
import { updateDoc, doc, getDoc, collection, getDocs } from 'firebase/firestore'
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
    const query = {}
    if(debug) query.debug = debug
    console.log('redirectToPhase', phase, query)
    router.push({ name: phase, query: query })
  }

  const reset = async () => {
    global.account.qrcodes = []
    await updateDoc(doc(db, 'accounts', global.account.uid), {
      qrcodes: [],
      questionsAnswered: [],
      redeemed_at: null,
      phase: 'qrcodes',
    })
    global.account = await accountGet(global.account.uid)
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

  const qrcodeLatestSet = async (code) => {
    localStorage.setItem(global.settings.qrcodes.keys.latest, code)
  }
  
  const qrcodeLatestGet = async () => {
    return localStorage.getItem(global.settings.qrcodes.keys.latest)
  }

  const qrcodeLatestDelete = async () => {
    localStorage.removeItem(global.settings.qrcodes.keys.latest)
  }

  const qrcodeHandle = async (code) => {
    const qrcode = global.qrcodes.find((item) => String(item.code) === String(code))
    // check if the qrcode exists
    if (qrcode) {
      // Check if the code has already been scanned
      if (global.account.qrcodes.includes(qrcode.code) && !isAdmin()) {
        global.dialog = {
          text: `Codice <strong>GIA' SCANSIONATO</strong>, RIPROVA!`,
          confirmText: 'Continua',
        }
        return
      }
      
      // Add the code to the account
      global.account.qrcodes.push(qrcode.code)
      // Save the account
      await updateDoc(doc(db, 'accounts', global.account.uid), {
        qrcodes: global.account.qrcodes,
      })
      global.dialog = {
        text: `Codice <strong>ACCETTATO</strong>, grazie!`,
        confirmText: 'Continua',
      }
      return
    } else {
      global.dialog = {
        text: 'Codice <strong>NON VALIDO</strong>, RIPROVA!',
        confirmText: 'Continua',
      }
    }
    return
  }

  return {
    isAdmin,
    isManager,
    getAbsoluteUrl,
    qrcodeHandle,
    qrcodeLatestSet,
    qrcodeLatestGet,
    qrcodeLatestDelete,
    accountGet,
    accountUpdate,
    accountUpdateByUid,
    setPhase,
    redirectToPhase,
    reset,
    copyToClipboard,
  }
}


