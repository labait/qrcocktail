<script setup>
import { inject, computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { signOut as firebaseSignOut } from 'firebase/auth'
import { auth } from '../firebase'
import Quiz from './Quiz.vue'
import Scan from '../components/scan.vue'

const global = inject('global')
const isAdmin = computed(() => Array.isArray(global?.roles) && global.roles.includes('admin'))

const points = ref(0)
const isScanning = ref(false)

function startScanner() {
  isScanning.value = true
}

function onQrDetected(code) {
  console.log('QR validato:', code)
  points.value++
  isScanning.value = false
}

async function logout() {
  await firebaseSignOut(auth)
}

/** Percentuale di riempimento del bicchiere (0–100) */
const fillPercent = computed(() => Math.min((points.value / 3) * 100, 100))
</script>

<template>
  <div class="home-root">
    <!-- ── QUIZ (quando punti >= 3) ── -->
    <div v-if="points >= 3" class="w-full">
      <Quiz />
    </div>

    <!-- ── DASHBOARD POST-LOGIN ── -->
    <template v-else>
      <div class="dash-root">

        <!-- Scanner attivo (fullscreen overlay) -->
        <div v-if="isScanning" class="scanner-overlay">
          <img src="../assets/Laba-logo.svg" class="logo-laba scanner-logo" alt="LABA Logo" />
          <h2 class="scanner-title">Scannerizza un QRcode</h2>

          <div class="scanner-frame">
            <Scan @detected="onQrDetected" />
          </div>
          <button class="cancel-btn" @click="isScanning = false">Annulla</button>
        </div>

        <!-- Schermata principale viola -->
        <template v-else>
          <img src="../assets/Laba-logo.svg" class="logo-laba dash-logo" alt="LABA Logo" />

           <!-- Admin Quick Nav -->
          <div v-if="isAdmin" class="admin-panel-dark">
            <h3 class="admin-label-dark">
              <span class="admin-rule"></span>
              Admin
            </h3>
            <div class="admin-grid">
              <RouterLink :to="{ name: 'qrcodes_admin' }" class="admin-card-dark">
                <svg class="admin-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                </svg>
                <span>Lista QR</span>
              </RouterLink>
              <RouterLink :to="{ name: 'qrcodes_new' }" class="admin-card-dark">
                <svg class="admin-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                <span>Crea Nuovo</span>
              </RouterLink>
            </div>
          </div>

          <!-- Testo istruzioni -->
          <div class="dash-instructions">
            <p class="dash-instr-primary">Scansiona almeno 3 QR Code<br>sparsi per LABA.</p>
            <p class="dash-instr-secondary">Una volta completate le scansioni,<br>il drink qui sotto si riempirà e<br>potrai accedere al quiz.</p>
          </div>

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

              <!-- Riempimento (liquido arancione animato) -->
              <g clip-path="url(#glass-clip)">
                <rect
                  x="0" y="0" width="200" height="200"
                  fill="#ff7230"
                  :transform="`translate(0, ${130 - (points / 3) * 120})`"
                  style="transition: transform 0.8s cubic-bezier(0.4,0,0.2,1)"
                />
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

          <!-- Pulsante scansiona -->
          <div class="dash-actions">
            <button class="dash-scan-btn" @click="startScanner">
              Scansiona il QRcode
            </button>
          </div>

          <!-- Contatore e progress dots -->
          <div class="dash-progress">
            <p class="dash-count">Da scansionare: {{ 3 - points }}</p>
            <div class="dash-dots">
              <span
                v-for="n in 3"
                :key="n"
                class="dash-dot"
                :class="{ filled: n <= points }"
              />
            </div>
          </div>

          <!-- Logout -->
          <button class="logout-btn" @click="logout">Esci dall'account</button>

        </template>
      </div>
    </template>
  </div>
</template>
