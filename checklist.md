# QRCocktail - Checklist del Progetto

## 📋 Panoramica Generale

Webapp mobile per evento con login Google, scanning di QR codes, quiz interattivo e redeem di cocktail gratuiti.

---

## ✅ CORE FEATURES IMPLEMENTATE

### 🔐 Autenticazione & Autorizzazione

- [x] **Login via Google** (`Home.vue` - `connectGoogle()`)
- [x] **Logout** (`Home.vue` - `logout()`)
- [x] **Stato auth con Firebase** (`App.vue` - `onAuthStateChanged`)
- [x] **Creazione account automatica** (`firebase.js` - `ensureAccountExists()`)
- [x] **Gestione ruoli (admin/user)** (`App.vue` - caricamento ruoli da Firestore)
- [x] **Admin Guard** (`useAdminGuard.js` - reindirizzamento se non admin)

### 🏠 Home Page / Dashboard

- [x] **Schermata pre-login** con hero arancione
- [x] **Steps di istruzioni** (3 step visivi)
- [x] **Dashboard post-login** (sfondo viola)
- [x] **Animazione bicchiere** con riempimento percentuale
- [x] **Tracciamento punti** (scansioni)
- [x] **Pulsante scan QR** sulla dashboard
- [x] **Avatar utente** sulla dashboard (left-positioned)
- [x] **Progress dots** per le scansioni
- [x] **Admin panel** (light e dark mode)
- [x] **Admin card links** (Nuovo, Modifica, etc.)

### 📱 Scanner QR Code

- [x] **Scanner UI** con video da camera
- [x] **BarcodeDetector API** (Chrome/Edge moderno)
- [x] **Riconoscimento QR codes**
- [x] **Overlay fullscreen** durante lo scanning
- [x] **Tasto Annulla** per interrompere scanning
- [x] **Gestione permessi camera**
- [x] **Emit 'detected' event** al riconoscimento QR

### 🎯 Quiz

- [x] **Trigger al 3° scan** (visibilità condizionata)
- [x] **Caricamento domande da Netlify Function**
- [x] **Funzione quizBuild** (`netlify/functions/quizBuild/quizBuild.mjs`)
- [x] **Parsing JSON domande** da output Claude
- [x] **Componente Question** con radio button
- [x] **Progress indicator** (dots + numero domande)
- [x] **Tracciamento domanda corrente**
- [x] **Gestione errori caricamento quiz**
- [x] **Header viola dedicato**

### 📧 QR Codes Management (Admin)

- [x] **Listing QR codes** (`QrcodesList.vue`)
- [x] **Tabella con colonne** (Grafica, Nome, ID, Azioni)
- [x] **Generazione QR code grafico** (`qrcode.vue` + `qrcode.js`)
- [x] **Creare nuovo QR** (`QrcodeNewView.vue` + `qrcode_form.vue`)
- [x] **Editare QR code** (`QrcodeEditView.vue`)
- [x] **Eliminare QR code** (con conferma)
- [x] **Form validazione** (Nome, Codice)
- [x] **Controllo unicità codice** (evita duplicati)
- [x] **Link di accesso rapido** ai QR (colonna link)
- [x] **Salvataggio in Firestore** (`qrcodes` collection)

### 🍹 Redeem Cocktail

- [x] **Routing verso redeem** (`/users/:uid/redeem`)
- [x] **View QrcodeRedeem** con placeholder
- [ ] **Logica di redeem** (TODO)
- [ ] **Validazione user entitlement** (TODO)
- [ ] **Aggiornamento stato prize_redeemed** (TODO)

### 🎨 UI / Styling

- [x] **Tailwind CSS v4** con tema custom
- [x] **Colore brand** (#ff7230 arancione)
- [x] **Background viola** (#7c6fe0) per sezioni admin/quiz
- [x] **Font Inter** custom
- [x] **Responsive mobile-first** (max-width 430px)
- [x] **Componenti stile**:
  - [x] Google button (dark, 50px border-radius)
  - [x] Scan button (arancione, ombra)
  - [x] Admin card grid
  - [x] Question answer labels
  - [x] Form fields con focus states
  - [x] Scroll behaviors

### 🔧 Infrastruktura

- [x] **Vite build tool**
- [x] **Vue 3 Composition API**
- [x] **Vue Router 4** con 8 routes
- [x] **Firebase Auth**
- [x] **Firebase Firestore**
- [x] **Netlify Functions** (`quizBuild.mjs`)
- [x] **Environment variables** (VITE_BASE_URL)
- [x] **Global state** (provide/inject)
- [x] **Reactive global object** per dati condivisi

---

## ⚠️ WORK IN PROGRESS / INCOMPLETE

### 🎯 Quiz Completamento

- [ ] **Submission risposte** (nessun handler)
- [ ] **Valutazione risposte** (logica scoring)
- [ ] **Mostra risultato** (pass/fail)
- [ ] **Generazione QR winCode** per il cocktail
- [ ] **Aggiornamento quiz_completed flag** in Firestore

### 🍹 Redeem Logica

- [ ] **Implementazione della funzione redeem**
- [ ] **Validazione del QR winCode**
- [ ] **Marcatura price_redeemed in Firestore**
- [ ] **Interfaccia per bar tender** (o self-service)
- [ ] **Tracking redeems**

### 📊 Data Management

- [ ] **Interfaccia admin per gestire disponibilità cocktail**
- [ ] **Statistiche partecipanti** (quanti hanno completato)
- [ ] **Statistiche redeem** (quanti hanno riscosso)
- [ ] **Export dati** per analytics

### 🎮 Game Logic

- [ ] **Validazione QR scannati** (controllo che il codice esiste in Firestore)
- [ ] **Evitare doppi scan** dello stesso QR
- [ ] **Timeout o scadenza** per le scansioni
- [ ] **Logica per reset ciclo** (nuovo utente/sessione)

### 🔔 Notifiche

- [ ] **Toast/snackbar** per feedback azioni
- [ ] **Stato loading** durante operazioni async

### 📱 Mobile UX

- [ ] **Fullscreen mode** camera scanner
- [ ] **Haptic feedback** su scan riuscito
- [ ] **Orientamento landscape** supporto
- [ ] **PWA** installable app

---

## 🚀 FEATURES OPZIONALI (NON CRITICAL)

- [ ] **Dark mode** completo
- [ ] **Internazionalizzazione** (i18n) - al momento solo IT
- [ ] **Leaderboard** (top scansionatori)
- [ ] **Share result** su social
- [ ] **Push notifications** per incoraggiare partecipazione
- [ ] **Analytics** integrazione (Google Analytics)
- [ ] **QR dinamici** (rigenera periodicamente)
- [ ] **Foto cocktail** nella redeem page
- [ ] **FAQ / Help** page
- [ ] **Offline mode** (service worker)

---

## 🐛 ISSUES NOTI / TO FIX

- [ ] **Form cancel button** ha testo "Ciao" (dovrebbe essere "Annulla")
- [ ] **QrcodeRedeem.vue** ha solo placeholder (redeem function non implementata)
- [ ] **Question.vue** non ha v-model per risposta (solo radio button, non submit)
- [ ] **Quiz.vue** non ha logica di navigazione tra domande (questionIndex non cambia)
- [ ] **Quiz.vue** non salva risposte né fa submit
- [ ] **Detections loop** nel scan.vue - nessuna callback su finish scanning
- [ ] **Error handling** assente in alcuni flussi (es. al rifiuto permessi camera)

---

## 📁 FILE STRUCTURE

```
src/
├── App.vue                          ✅ Shell principale (+ global.points)
├── Auth.vue                         (non usato)
├── firebase.js                      ✅ Configurazione Firebase
├── main.js                          ✅ Entry point
├── routing.js                       ✅ Definizione routes (+ /scan)
├── style.css                        ✅ Tailwind + custom styles
├── assets/
│   ├── hero.png
│   ├── Laba-logo.svg               ✅ Logo
│   └── ...
├── components/
│   ├── loading.vue                 ✅ Spinner
│   ├── progress.vue                (non usato)
│   ├── qrcode_form.vue             ✅ Form create/edit QR
│   ├── qrcode.vue                  ✅ QR code renderer
│   ├── Question.vue                ⚠️ Incompleto (no submit)
│   └── scan.vue                    ✅ Scanner (logica barcode)
├── composables/
│   └── useAdminGuard.js            ✅ Protezione routes admin
└── views/
    ├── Home.vue                    ✅ Home + Dashboard (refactored)
    ├── ScanView.vue                ✅ Scanner fullscreen (NEW)
    ├── QrcodeEditView.vue          ✅ Edit wrapper
    ├── QrcodeNewView.vue           ✅ Create wrapper
    ├── QrcodeRedeem.vue            ⚠️ Incompleto (placeholder)
    ├── QrcodesList.vue             ✅ Admin console
    ├── QrcodesView.vue             ✅ QR display page
    └── Quiz.vue                    ⚠️ Incompleto (no submit)

netlify/functions/
├── quizBuild/
│   ├── quizBuild.mjs               ✅ Claude API integration
│   └── debug.json
└── test/
    └── test.mjs
```

---

## 📊 FIRESTORE COLLECTIONS

### `accounts/{uid}`

```json
{
  "uid": "string",
  "roles": ["admin", ...],          ✅
  "quiz_completed": boolean,         ⚠️ (never set to true)
  "price_redeemed": boolean,         ⚠️ (never set to true)
  "qrcodes": []                      ✅ (array of scanned codes)
}
```

### `qrcodes/{docId}`

```json
{
  "name": "string",                  ✅
  "code": "string",                  ✅
}
```

---

## 🔄 FLUSSO UTENTE (AS-IS vs TO-DO)

### 1. Login ✅

- Utente vede Home pre-login → Clicca "Accedi con Google" → Redirect a Google → Ritorna loggato

### 2. Dashboard ✅

- Visualizza bicchiere vuoto
- Vede bottone "Scansiona il QRcode"
- Legge 3 istruzioni

### 3. Scanning ✅ (ora in ScanView)

- Clicca "Scansiona il QRcode" → Naviga a `/scan`
- Fullscreen scanner attiva (ScanView.vue)
- Scansiona QR → Incrementa `global.points`
- Torna a Home (router.back())
- Dopo 3 scansioni → Quiz si mostra (visibilità condizionata)

### 4. Quiz ⚠️ **DA COMPLETARE**

- Vede prima domanda
- Legge opzioni → Seleziona risposta (radio button)
- **❌ Nessun bottone "Avanti"** → Non sa come navigare
- **❌ Nessun bottone "Invia"** → Non sa come submittare
- **❌ Nessun feedback** su correttezza risposte

### 5. Redeem ⚠️ **DA COMPLETARE**

- Dovrebbe ricevere QR winCode dopo quiz
- Redeem code in bar per il cocktail
- **❌ Pagina è solo placeholder**

### 6. Admin Console ✅

- Accesso a `/qrcodes` (se admin)
- Vede tabella QR codes
- Può creare (+Nuovo) → Form con Nome/Codice
- Può editare (Modifica link) → Form precompilato
- Può eliminare (Elimina button) → Conferma → Cancella

---

## 📝 NOTES

- **Debug flag** attivo in App.vue (`global.debug = true`)
- **Base URL** configurabile via `VITE_BASE_URL`
- **QR Code size** predefinito 400px (configurabile)
- **BarcodeDetector** richiede browser moderno (Chrome/Edge, non Firefox)
- **Firebase config** hardcoded (non ideale per produzione)
- **Netlify Functions** usa Claude API per generare domande
- **Tailwind v4** con `@import` (non JIT)

---

## 🎯 PRIORITÀ COMPLETAMENTO

### 🔴 CRITICO (blocca user flow)

1. [ ] Implementare logica navigazione domande in Quiz.vue
2. [ ] Aggiungere submit bottone e logica in Question.vue
3. [ ] Implementare scoring e risultato quiz
4. [ ] Generare/mostrare QR winCode dopo quiz pass
5. [ ] Implementare logica redeem in QrcodeRedeem.vue

### 🟡 IMPORTANTE (UX completa)

6. [ ] Validazione QR scannati vs Firestore
7. [ ] Toast/snackbar feedback
8. [ ] Evitare doppi scan
9. [ ] Admin panel per gestire disponibilità cocktail

### 🟢 NICE-TO-HAVE (polish)

10. [ ] Haptic feedback
11. [ ] Leaderboard
12. [ ] PWA setup
13. [ ] Analytics
14. [ ] Dark mode

---

## ✨ ULTIMA MODIFICA

Data checklist: **14 Aprile 2026**
Stato progetto: **~60% completato** (core features OK, game logic + redeem incomplete)
