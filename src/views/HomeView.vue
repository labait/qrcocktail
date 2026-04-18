<script setup>
import { inject, computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { signOut as firebaseSignOut } from 'firebase/auth'
import { auth, db } from '../firebase'
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import Quiz from './Quiz.vue'
import Scan from '../components/Scan.vue'
import Qrcode from '../components/qrcode.vue'

const global = inject('global')
const isLoggedIn = computed(() => !!global?.user)
const isAdmin = computed(() => {
  const roles = global?.account?.roles
  return Array.isArray(roles) && roles.includes('admin')
})

const phase = computed(() => global?.account?.phase || 'qrcode')
const scannedCodes = computed(() => global?.account?.qrcodes || [])
const REQUIRED_SCANS = 3

const isScanning = ref(false)
const scanError = ref('')

function startScanner() {
  scanError.value = ''
  isScanning.value = true
}

async function onQrDetected(rawValue) {
  isScanning.value = false
  scanError.value = ''

  try {
    // Estrai il codice dall'URL scansionato (ultimo segmento della path)
    let code = rawValue
    try {
      const url = new URL(rawValue)
      const segments = url.pathname.split('/').filter(Boolean)
      code = segments[segments.length - 1] || rawValue
    } catch {
      // non è un URL, usa il valore raw come codice
    }

    // Controlla duplicati
    if (scannedCodes.value.includes(code)) {
      scanError.value = 'Hai già scansionato questo QR code!'
      return
    }

    // Valida che il codice esista nella collection qrcodes di Firestore
    const matchingQr = global.qrcodes.find(q => q.code === code)
    if (!matchingQr) {
      scanError.value = 'QR code non valido.'
      return
    }

    // Salva il codice nell'array dell'utente
    const uid = global.user.uid
    const accountRef = doc(db, 'accounts', uid)

    const newCount = scannedCodes.value.length + 1
    const updates = { qrcodes: arrayUnion(code) }

    // Se raggiunge la soglia, transizione a phase quiz
    if (newCount >= REQUIRED_SCANS) {
      updates.phase = 'quiz'
    }

    await updateDoc(accountRef, updates)

    // Aggiorna lo stato locale
    global.account.qrcodes = [...scannedCodes.value, code]
    if (newCount >= REQUIRED_SCANS) {
      global.account.phase = 'quiz'
    }
  } catch (err) {
    console.error('Errore durante la scansione:', err)
    scanError.value = 'Errore durante il salvataggio. Riprova.'
  }
}

async function logout() {
  await firebaseSignOut(auth)
}

/** Percentuale di riempimento del bicchiere (0–100) */
const fillPercent = computed(() => Math.min((scannedCodes.value.length / REQUIRED_SCANS) * 100, 100))
const remaining = computed(() => Math.max(REQUIRED_SCANS - scannedCodes.value.length, 0))
</script>

<template>
  <div class="home-root">

    <!-- ── PHASE: QUIZ ── -->
    <div v-if="phase === 'quiz'" class="w-full">
      <Quiz />
    </div>

    <!-- ── PHASE: REDEEM ── -->
    <div v-else-if="phase === 'redeem'" class="dash-root">
      <img src="../assets/Laba-logo.svg" class="logo-laba dash-logo" alt="LABA Logo" />
      <h1 class="dash-instr-primary">Complimenti!</h1>
      <p class="dash-instr-secondary">Hai superato il quiz. Mostra questo QR Code al barman per ritirare il tuo cocktail omaggio.</p>
      <div class="bg-white p-6 rounded-2xl shadow-lg mt-4">
        <Qrcode v-if="global.user?.uid" :path="'users/' + global.user.uid + '/redeem'" />
      </div>
      <button class="logout-btn mt-8" @click="logout">Esci dall'account</button>
    </div>

    <!-- ── PHASE: THANKS ── -->
    <div v-else-if="phase === 'thanks'" class="dash-root">
      <img src="../assets/Laba-logo.svg" class="logo-laba dash-logo" alt="LABA Logo" />
      <h1 class="dash-instr-primary">Grazie!</h1>
      <p class="dash-instr-secondary">Grazie per aver partecipato.<br>Buona serata e goditi il tuo cocktail! 🍹</p>
      <button class="logout-btn mt-8" @click="logout">Esci dall'account</button>
    </div>

    <!-- ── PHASE: LOST ── -->
    <div v-else-if="phase === 'lost'" class="dash-root">
      <img src="../assets/Laba-logo.svg" class="logo-laba dash-logo" alt="LABA Logo" />
      <h1 class="dash-instr-primary">Peccato!</h1>
      <p class="dash-instr-secondary">Non hai superato il quiz.<br>Grazie comunque per aver partecipato!</p>
      <button class="logout-btn mt-8" @click="logout">Esci dall'account</button>
    </div>

    <!-- ── PHASE: QRCODE (dashboard con scanner) ── -->
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
              <RouterLink :to="{ name: 'admin_qrcodes_list' }" class="admin-card-dark">
                <svg class="admin-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                </svg>
                <span>Lista QR</span>
              </RouterLink>
              <RouterLink :to="{ name: 'admin_qrcodes_new' }" class="admin-card-dark">
                <svg class="admin-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                <span>Crea Nuovo</span>
              </RouterLink>
            </div>
          </div>

          <!-- Testo istruzioni -->
          <div class="dash-instructions">
            <p class="dash-instr-primary">Scansiona almeno {{ REQUIRED_SCANS }} QR Code<br>sparsi per LABA.</p>
            <p class="dash-instr-secondary">Una volta completate le scansioni,<br>il drink qui sotto si riempirà e<br>potrai accedere al quiz.</p>
          </div>

          <!-- Errore scansione -->
          <p v-if="scanError" class="text-center text-sm font-semibold" style="color: #ef4444;">{{ scanError }}</p>

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
                <rect x="0" :y="scannedCodes.length >= 1 ? 90 : 178" width="200" :height="scannedCodes.length >= 1 ? 40 : 0" fill="#ffaa55" style="transition: all 0.6s ease" />
                <!-- Livello 2 -->
                <rect x="0" :y="scannedCodes.length >= 2 ? 50 : 90" width="200" :height="scannedCodes.length >= 2 ? 40 : 0" fill="#ff8d3f" style="transition: all 0.6s ease 0.1s" />
                <!-- Livello 3 -->
                <rect x="0" :y="scannedCodes.length >= 3 ? 10 : 50" width="200" :height="scannedCodes.length >= 3 ? 40 : 0" fill="#ff7230" style="transition: all 0.6s ease 0.2s" />
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
            <p class="dash-count">Da scansionare: {{ remaining }}</p>
            <div class="dash-dots">
              <span
                v-for="n in REQUIRED_SCANS"
                :key="n"
                class="dash-dot"
                :class="{ filled: n <= scannedCodes.length }"
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
