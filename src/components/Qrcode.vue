<script setup>
import { computed, inject, ref, watch } from 'vue'
import QRCode from 'qrcode'



const props = defineProps({
  url: {
    type: String,
    required: true,
  },
  /** Larghezza/altezza QR in px; se omesso usa `global.settings.qrcode_size` o 200 */
  size: {
    type: Number,
    default: null,
  },
})

const global = inject('global')

const qrSize = computed(() => {
  if (props.size != null && props.size > 0) return Math.round(props.size)
  return Number(global?.settings?.qrcode_size) || 200
})


const qrDataUrl = ref('')

watch(
  [props.url, qrSize],
  async ([url, size]) => {
    if (!url) {
      qrDataUrl.value = ''
      return
    }
    try {
      console.log('generating QR code for', url, 'with size', size)
      qrDataUrl.value = await QRCode.toDataURL(url, {
        width: size,
        margin: 2,
      })
    } catch (err) {
      console.error(err)
      qrDataUrl.value = ''
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="inline-flex flex-col items-center gap-2">
    <img
      v-if="qrDataUrl"
      :src="qrDataUrl"
      :alt="url"
      :width="qrSize"
      :height="qrSize"
      :style="{ width: `${qrSize}px`, height: `${qrSize}px` }"
    />
  </div>
</template>
