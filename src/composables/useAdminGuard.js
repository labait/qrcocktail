import { inject, watch } from 'vue'
import { useRouter } from 'vue-router'

/**
 * Reindirizza a home se, una volta noto lo stato account, l’utente non è admin.
 */
export function useAdminGuard() {
  const global = inject('global')
  const router = useRouter()

  watch(
    () => [global.accountReady, global.user, global.roles],
    () => {
      if (!global.accountReady) return
      if (!global.user) {
        router.replace({ name: 'home' })
        return
      }
      const roles = global.roles
      if (!Array.isArray(roles) || !roles.includes('admin')) {
        router.replace({ name: 'home' })
      }
    },
    { immediate: true },
  )
}
