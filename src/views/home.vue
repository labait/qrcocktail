<script setup>
import { inject, computed, ref } from 'vue'
import Progress from '../components/progress.vue'
import Quiz from './Quiz.vue'
import Scan from '../components/scan.vue'
import { RouterLink } from 'vue-router'
import { signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

const global = inject('global')

const isLoggedIn = computed(() => !!global?.user)
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

async function connectGoogle() {
  await signInWithPopup(auth, googleProvider)
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

    <!-- ── SCHERMATA PRE-LOGIN ── -->
    <template v-else-if="!isLoggedIn">

      <!-- Hero arancione -->
      <section class="hero-section">
        <div class="hero-logo">
          <img src="../assets/Laba-logo.svg" class="logo-laba" alt="LABA Logo" />
        </div>

        <div class="hero-text">
          <h1 class="hero-title">Take a Cocktail</h1>
          <p class="hero-sub">Partecipa al QUIZ e vinci un coupon omaggio!</p>
        </div>
      </section>

      <!-- Steps section -->
      <section class="steps-section">
        <p class="steps-label">COSA DOVRAI FARE:</p>

        <ul class="steps-list">
          <li class="step-item">
            <span class="step-number">1</span>
            <span class="step-text">Scansiona almeno x QR Code</span>
          </li>
          <li class="step-item">
            <span class="step-number">2</span>
            <span class="step-text">Completa il QUIZ</span>
          </li>
          <li class="step-item">
            <span class="step-number">3</span>
            <span class="step-text">Ricevi un cocktail omaggio</span>
          </li>
        </ul>

        <!-- Google Sign-in -->
        <div class="cta-wrapper">
          <button class="google-btn" @click="connectGoogle">
            <svg class="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Accedi con Google</span>
          </button>
        </div>
      </section>

    </template>

    <!-- ── DASHBOARD POST-LOGIN ── -->
    <template v-else>
      <div class="dash-root">

        <!-- Scanner attivo (fullscreen overlay) -->
        <div v-if="isScanning" class="scanner-overlay">
          <div class="scanner-frame">
            <Scan @detected="onQrDetected" />
          </div>
          <button class="cancel-btn" @click="isScanning = false">Annulla</button>
        </div>

        <!-- Schermata principale viola -->
        <template v-else>

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
                  :transform="`translate(0, ${200 - fillPercent * 2})`"
                  style="transition: transform 0.8s cubic-bezier(0.4,0,0.2,1)"
                />
              </g>

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
            <!-- Avatar utente -->
            <div class="dash-avatar">
              <img
                v-if="global.user?.photoURL"
                :src="global.user.photoURL"
                :alt="global.user.displayName || 'Avatar'"
                referrerpolicy="no-referrer"
              />
              <span v-else>{{ (global.user?.displayName || global.user?.email || '?').charAt(0).toUpperCase() }}</span>
            </div>

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

          <!-- Logout -->
          <button class="logout-btn" @click="logout">Esci dall'account</button>

        </template>
      </div>
    </template>

    <!-- DEBUG -->
    <div style="position:fixed;bottom:0;left:0;right:0;background:#000;color:#0f0;font:12px monospace;padding:8px;z-index:9999;opacity:0.8;">
      <strong>DEBUG</strong> |
      accountReady: {{ global.accountReady }} |
      user: {{ global.user?.email ?? 'null' }} |
      roles: {{ JSON.stringify(global.roles) }} |
      points: {{ points }}
    </div>

  </div>
</template>