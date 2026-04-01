import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'

/**
 * Configurazione console Firebase (Impostazioni progetto → Le tue app → Config).
 * In locale, valorizza le variabili in `.env` (prefisso VITE_ per Vite).
 */
const firebaseConfig = {
  apiKey: "AIzaSyBuwyZQTnt17bnseCZE3BkBlpt_YD0qCDE",
  authDomain: "qrcocktail-3a3d8.firebaseapp.com",
  projectId: "qrcocktail-3a3d8",
  storageBucket: "qrcocktail-3a3d8.firebasestorage.app",
  messagingSenderId: "961521085532",
  appId: "1:961521085532:web:3403cef8b075c44bb3ca99",
  measurementId: "G-3PKGJME8PX"
}

const app = initializeApp(firebaseConfig)

/** Istanza Auth (Google Sign-In va abilitato in Firebase Console → Authentication → Sign-in method) */
export const auth = getAuth(app)

export const googleProvider = new GoogleAuthProvider()

export const db = getFirestore(app)

/**
 * Crea `accounts/{uid}` con i campi predefiniti solo se il documento non esiste.
 */
export async function ensureAccountExists(uid) {
  const ref = doc(db, 'accounts', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      uid,
      roles: [],
      quiz_completed: false,
      price_redeemed: false,
      qrcodes: [],
    })
  }
}

export { app }
