<script setup>
import { ref, inject, computed, onMounted } from 'vue'

const global = inject('global')
const points = computed(() => global.points)

onMounted(() => {
  global.bgColor = '#7e63e0'
})
</script>

<template>
    <!-- Bicchiere cocktail animato -->
    <div class="glass-wrapper">
      <svg class="glass-svg" viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg">
        <!-- Clip per il riempimento -->
        <defs>
          <clipPath id="glass-clip">
            <!-- Forma approssimata del bicchiere (zona liquido) -->
            <polygon points="30,10 170,10 115,130 115,175 85,175 85,130"/>
          </clipPath>
        </defs>

        <!-- Riempimento a 3 livelli separati (sfumature di arancione) -->
        <g clip-path="url(#glass-clip)">
          <!-- Livello 1 -->
          <rect x="0" :y="points >= 1 ? 90 : 178" width="200" :height="points >= 1 ? 40 : 0" fill="#ffaa55" style="transition: all 0.6s ease" />
          <!-- Livello 2 -->
          <rect x="0" :y="points >= 2 ? 50 : 90" width="200" :height="points >= 2 ? 40 : 0" fill="#ff8d3f" style="transition: all 0.6s ease 0.1s" />
          <!-- Livello 3 -->
          <rect x="0" :y="points >= 3 ? 10 : 50" width="200" :height="points >= 3 ? 40 : 0" fill="#ff7230" style="transition: all 0.6s ease 0.2s" />
        </g>

        <!-- Suddivisioni del bicchiere (sempre visibili) -->
        <line x1="66.7" y1="90" x2="133.3" y2="90" stroke="rgba(255,255,255,0.4)" stroke-width="3" stroke-dasharray="5,4" />
        <line x1="48.3" y1="50" x2="151.7" y2="50" stroke="rgba(255,255,255,0.4)" stroke-width="3" stroke-dasharray="5,4" />

        <!-- Contorno bicchiere (stroke arancione, sempre visibile) -->
        <!-- Calice -->
        <polygon
          points="30,10 170,10 115,130 85,130"
          fill="none" stroke="#ff7230" stroke-width="12"
          stroke-linejoin="round"
        />
        <!-- Gambo -->
        <line x1="100" y1="130" x2="100" y2="178" stroke="#ff7230" stroke-width="12" stroke-linecap="round"/>
        <!-- Base -->
        <line x1="65" y1="178" x2="135" y2="178" stroke="#ff7230" stroke-width="12" stroke-linecap="round"/>
      </svg>
    </div>


    <div class="flex items-center justify-center mb-4">
      <button class="btn btn-primary" @click="startScanner">
        Scansiona il QRcode
      </button>
    </div>

</template>