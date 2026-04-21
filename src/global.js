import { reactive } from 'vue'

export const global = reactive({
  debug: (() => {
    // return false // TODO: force debug value
    return (
      [1, 'true'].includes(import.meta.env.VITE_DEBUG) ||
      new URL(window.location.href).searchParams.has('debug')
    )
  })(),
  loading: 0,
  bgColor: '#ccc',
  base_url: import.meta.env.VITE_BASE_URL,
  settings: {
    qrcodes: {
      keys: {
        latest: 'qrcocktail-qrcode-latest-scanned',
      },
      required: 5,
      size: 400,
    },
    quiz: {
      questions: {
        count: 5,
      },
    },
    redeem: {
      max: 100,
    },
  },
  account: null,
  qrcodes: [],
  user: null,
  dialog: {},
})
