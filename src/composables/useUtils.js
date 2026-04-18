import { inject } from 'vue'
import { useRouter } from 'vue-router'

export function useUtils() {
  const global = inject('global')
  const router = useRouter()
  const base_url = import.meta.env.VITE_BASE_URL

  const getAbsoluteUrl = (path) => {
    return `${base_url}${path}`
  }

  const isAdmin = () => global.account && Array.isArray(global.account.roles) && global.account.roles.includes('admin')

  const redirectToPhase = (phase) => {
    if (!phase) phase = global.account?.phase ?? 'instructions'
    router.push({ name: phase })
  }

  return {
    isAdmin,
    getAbsoluteUrl,
    redirectToPhase,
  }
}


