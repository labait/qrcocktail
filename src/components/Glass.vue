<script setup>
import { inject, computed } from 'vue'

const props = defineProps({
  points: {
    type: Number,
    required: true,
  },
})

const global = inject('global')

const BOWL_TOP = 10
const BOWL_BOTTOM = 130
const BOWL_INNER_HEIGHT = BOWL_BOTTOM - BOWL_TOP

/** Colore livello i (1 = base, n = cima): da #ffaa55 a #ff7230 */
function layerColor(i, n) {
  if (n <= 1) return '#ff7230'
  const t = (i - 1) / (n - 1)
  const r = Math.round(0xff)
  const g = Math.round(0xaa + (0x72 - 0xaa) * t)
  const b = Math.round(0x55 + (0x30 - 0x55) * t)
  return `rgb(${r}, ${g}, ${b})`
}

const required = computed(() =>
  Math.max(1, Number(global?.settings?.qrcodes?.required) || 1),
)

const layers = computed(() => {
  const n = required.value
  const h = BOWL_INNER_HEIGHT / n
  const out = []
  for (let i = 1; i <= n; i++) {
    const filled = props.points >= i
    const y = filled
      ? BOWL_BOTTOM - i * h
      : i === 1
        ? 178
        : BOWL_BOTTOM - (i - 1) * h
    const height = filled ? h : 0
    out.push({
      i,
      y,
      height,
      fill: layerColor(i, n),
      delay: `${(i - 1) * 0.1}s`,
    })
  }
  return out
})

const dividerYs = computed(() => {
  const n = required.value
  const h = BOWL_INNER_HEIGHT / n
  const ys = []
  for (let k = 1; k < n; k++) {
    ys.push(BOWL_BOTTOM - k * h)
  }
  return ys
})
</script>

<template>
  <!-- Bicchiere cocktail animato -->
  <div class="glass-wrapper h-[30vh] min-[390px]:h-[45vh] md:h-[55vh] p-4">
    <svg class="glass-svg w-full h-full object-contain" viewBox="0 0 200 190" xmlns="http://www.w3.org/2000/svg">
      <!-- Clip per il riempimento -->
      <defs>
        <clipPath id="glass-clip">
          <!-- Solo coppa: liquido non entra nel gambo -->
          <polygon points="30,10 170,10 115,130 85,130" />
        </clipPath>
      </defs>

      <!-- Riempimento a N livelli (sfumature di arancione) -->
      <g clip-path="url(#glass-clip)">
        <rect
          v-for="layer in layers"
          :key="layer.i"
          x="0"
          :y="layer.y"
          width="200"
          :height="layer.height"
          :fill="layer.fill"
          :style="{ transition: `all 0.6s ease ${layer.delay}` }"
        />
      </g>

      <!-- Suddivisioni: stesso clip della coppa così le linee seguono il bordo -->
      <g clip-path="url(#glass-clip)">
        <line
          v-for="(dy, idx) in dividerYs"
          :key="idx"
          x1="0"
          :y1="dy"
          x2="200"
          :y2="dy"
          stroke="rgba(255,255,255,0.4)"
          stroke-width="3"
          stroke-dasharray="5,4"
        />
      </g>

      <!-- Contorno bicchiere (stroke arancione, sempre visibile) -->
      <polygon
        points="30,10 170,10 115,130 85,130"
        fill="none"
        stroke="#ff7230"
        stroke-width="12"
        stroke-linejoin="round"
      />

      <!-- Gambo -->
      <line x1="100" y1="130" x2="100" y2="178" stroke="#ff7230" stroke-width="12" stroke-linecap="round" />
      <!-- Base -->
      <line x1="65" y1="178" x2="135" y2="178" stroke="#ff7230" stroke-width="12" stroke-linecap="round" />
    </svg>
  </div>
</template>
