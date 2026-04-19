import { inject } from 'vue'
import { useRouter } from 'vue-router'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'

export function useUtils() {
  const global = inject('global')
  const router = useRouter()
  const base_url = import.meta.env.VITE_BASE_URL

  const getAbsoluteUrl = (path) => {
    return `${base_url}${path}`
  }

  const isAdmin = () => global.account && Array.isArray(global.account.roles) && global.account.roles.includes('admin')

  
  const setPhase = async (phase) => {
    if (!global.account) {
      console.error('Account not found')
      return
    }
    global.account.phase = phase
    await updateDoc(doc(db, 'accounts', global.account.uid), {
      phase: phase,
    })
    global.redirectToPhase(phase)
  }


  const redirectToPhase = (phase) => {
    if (!phase) phase = global.account?.phase ?? 'instructions'
    router.push({ name: phase })
  }

  return {
    isAdmin,
    getAbsoluteUrl,
    setPhase,
    redirectToPhase,
  }
}


