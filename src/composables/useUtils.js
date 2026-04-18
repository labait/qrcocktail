import { inject } from 'vue'
import { useRouter } from 'vue-router'

export function useUtils() {
  const global = inject('global')
  const router = useRouter()
  const base_url = import.meta.env.VITE_BASE_URL

  const getAbsoluteUrl = (path) => {
    return `${base_url}${path}`
  }

  const redirectToPhase = (phase) => {
    if (!phase) phase = global.account?.phase ?? 'instructions'
    router.push({ name: phase })
  }

  return {
    getAbsoluteUrl,
    redirectToPhase,
  }
}


