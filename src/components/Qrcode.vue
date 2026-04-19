<script setup>
import { computed, inject, ref, watch, onMounted } from 'vue'
import QRCode from 'qrcode'

const props = defineProps({
  url: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    default: null,
  },
})

const global = inject('global')
const qrDataUrl = ref('')

onMounted(async () => {
  qrDataUrl.value = await QRCode.toDataURL(props.url, {
    width: (props.size ?? global.settings.qrcodes.size),
      margin: 2,
    })
})
</script>

<template>
  <div class="inline-flex flex-col items-center gap-2">
    <img
      v-if="qrDataUrl"
      :src="qrDataUrl"
      :alt="url"
      :width="size"
      :height="size"
      :style="{ width: `${size}px`, height: `${size}px` }"
    />
  </div>
</template>
