<script setup>
import { onBeforeUnmount, onMounted, ref, computed } from 'vue'

const emit = defineEmits(['detected', 'error', 'started', 'stopped', 'exit'])

const props = defineProps({
  facingMode: {
    type: String,
    default: 'environment',
  },
  scanIntervalMs: {
    type: Number,
    default: 250,
  },
  autoStart: {
    type: Boolean,
    default: true,
  },
})

const videoRef = ref(null)
const streamRef = ref(null)
const isScanning = ref(false)
const isBusy = ref(false)
const canUseBarcodeDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window
const detector = canUseBarcodeDetector ? new window.BarcodeDetector({ formats: ['qr_code'] }) : null

let intervalId = null

function stopStreamTracks() {
  if (!streamRef.value) return
  for (const track of streamRef.value.getTracks()) {
    track.stop()
  }
  streamRef.value = null
}

async function start() {
  if (isScanning.value) return
  if (!navigator?.mediaDevices?.getUserMedia) {
    emit('error', new Error('Camera API non supportata dal browser'))
    return
  }
  if (!canUseBarcodeDetector) {
    emit('error', new Error('BarcodeDetector non supportato: usa Chrome/Edge mobile o desktop recente'))
    return
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: props.facingMode },
      },
      audio: false,
    })

    streamRef.value = stream
    if (videoRef.value) {
      videoRef.value.srcObject = stream
      await videoRef.value.play()
    }

    isScanning.value = true
    intervalId = window.setInterval(scanFrame, props.scanIntervalMs)
    emit('started')
  } catch (error) {
    emit('error', error)
  }
}

function stop() {
  if (intervalId) {
    window.clearInterval(intervalId)
    intervalId = null
  }
  isScanning.value = false
  stopStreamTracks()
  emit('stopped')
}

async function scanFrame() {
  if (!videoRef.value || !detector || isBusy.value) return
  if (videoRef.value.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return

  isBusy.value = true
  try {
    const barcodes = await detector.detect(videoRef.value)
    const match = barcodes?.find((item) => item?.rawValue)
    if (!match?.rawValue) return

    emit('detected', match.rawValue)
    stop()
  } catch (error) {
    emit('error', error)
  } finally {
    isBusy.value = false
  }
}

onMounted(() => {
  if (props.autoStart) {
    start()
  }
})

onBeforeUnmount(() => {
  stop()
})

defineExpose({ start, stop })

const videoTransform = computed(() => {
  // Flip horizontally for user ('user') camera
  return props.facingMode === 'user'
    ? 'none'
    : 'scaleX(-1)'
})
</script>

<template>
  <div class="w-full absolute inset-0">
    <video
      ref="videoRef"
      class="h-full w-full aspect-square object-cover mb-4 rounded-[4px] ring-2 ring-white/40 shadow-sm"
      :style="{ transform: videoTransform }"
      autoplay
      playsinline
      muted
    />
    <div class="flex justify-center mb-8 z-20 absolute bottom-0 left-0 right-0"> 
      <a href="#" class="btn btn-secondary " @click.prevent="emit('exit')">Esci</a>
    </div>
  </div>
</template>