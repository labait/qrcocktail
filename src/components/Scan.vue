<script setup>
import { onBeforeUnmount, onMounted, ref, computed } from 'vue'
import jsQR from 'jsqr'

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
const canUseBarcodeDetector =
  typeof window !== 'undefined' && 'BarcodeDetector' in window
const detector = canUseBarcodeDetector
  ? new window.BarcodeDetector({ formats: ['qr_code'] })
  : null

let intervalId = null
/** Canvas offscreen per jsQR (Safari iOS e browser senza BarcodeDetector) */
let decodeCanvas = null
let decodeCtx = null

function stopStreamTracks() {
  if (!streamRef.value) return
  for (const track of streamRef.value.getTracks()) {
    track.stop()
  }
  streamRef.value = null
}

async function openCamera() {
  const base = { audio: false }
  try {
    return await navigator.mediaDevices.getUserMedia({
      ...base,
      video: { facingMode: { ideal: props.facingMode } },
    })
  } catch {
    return await navigator.mediaDevices.getUserMedia({
      ...base,
      video: true,
    })
  }
}

async function start() {
  if (isScanning.value) return
  if (!navigator?.mediaDevices?.getUserMedia) {
    emit('error', new Error('Camera API non supportata dal browser'))
    return
  }

  try {
    const stream = await openCamera()

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
  if (!videoRef.value || isBusy.value) return
  if (videoRef.value.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return

  isBusy.value = true
  try {
    if (detector) {
      const barcodes = await detector.detect(videoRef.value)
      const match = barcodes?.find((item) => item?.rawValue)
      if (match?.rawValue) {
        stop()
        emit('detected', match.rawValue)
        
      }
      return
    }

    const v = videoRef.value
    const w = v.videoWidth
    const h = v.videoHeight
    if (!w || !h) return

    if (!decodeCanvas) {
      decodeCanvas = document.createElement('canvas')
      decodeCtx = decodeCanvas.getContext('2d', { willReadFrequently: true })
    }
    if (decodeCanvas.width !== w || decodeCanvas.height !== h) {
      decodeCanvas.width = w
      decodeCanvas.height = h
    }
    decodeCtx.drawImage(v, 0, 0, w, h)
    const imageData = decodeCtx.getImageData(0, 0, w, h)
    const result = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth',
    })
    if (result?.data) {
      emit('detected', result.data)
      stop()
    }
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
  // Flip only on desktop (min-width: 768px)
  if (props.facingMode === 'user') return 'none'
  // Only apply flip if width is >= 768px (desktop)
  if (window.innerWidth >= 768) return 'scaleX(-1)'
  return 'none'
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
