import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth'
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

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

/** Istanza Auth (Google e Microsoft vanno abilitati in Firebase Console → Authentication) */
export const auth = getAuth(app)

export const googleProvider = new GoogleAuthProvider()

/**
 * Microsoft — abilitare in Firebase Console → Authentication → Microsoft.
 * Se in Azure l’app è solo per un tenant (es. LABA) e NON è “multitenant”, Firebase usa
 * l’endpoint /common e Azure risponde AADSTS50194: imposta allora `VITE_MICROSOFT_TENANT_ID`
 * nel `.env` con il GUID del tenant oppure il dominio Azure AD (es. `laba.edu` o `xxx.onmicrosoft.com`).
 * In alternativa: Portale Azure → registrazioni app → tipi di account supportati → “Multitenant”.
 */
export const microsoftProvider = new OAuthProvider('microsoft.com')
{
  const raw = import.meta.env.VITE_MICROSOFT_TENANT_ID
  const tenant = typeof raw === 'string' ? raw.trim() : ''
  const params = { prompt: 'select_account' }
  if (tenant) params.tenant = tenant
  microsoftProvider.setCustomParameters(params)
}

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
      phase: 'qrcodes',
      quiz_completed: false,
      price_redeemed: false,
      qrcodes: [],
    })
  }
}

/**
 * Aggiorna accounts/{uid} con email e nome dopo sign-in OAuth (Google o Microsoft).
 */
export async function syncAccountFromAuthProfile(uid, user, additionalUserInfo) {
  await ensureAccountExists(uid)
  const profile = additionalUserInfo?.profile ?? {}
  const payload = {}

  const email =
    (typeof user.email === 'string' && user.email.trim()) ||
    (typeof profile.email === 'string' && profile.email.trim()) ||
    (typeof profile.mail === 'string' && profile.mail.trim()) ||
    (typeof profile.userPrincipalName === 'string' &&
      profile.userPrincipalName.trim())
  if (email) payload.email = email

  const givenRaw =
    profile.given_name ?? profile.givenName ?? profile.first_name
  const familyRaw =
    profile.family_name ?? profile.surname ?? profile.last_name
  const given =
    typeof givenRaw === 'string' ? givenRaw.trim() : ''
  const family =
    typeof familyRaw === 'string' ? familyRaw.trim() : ''
  if (given && family) {
    payload.firstname = given
    payload.lastname = family
  } else {
    const fullName = [profile.name, user.displayName].find(
      (s) => typeof s === 'string' && s.trim(),
    )
    if (fullName) payload.name = fullName.trim()
  }

  if (Object.keys(payload).length === 0) return

  await updateDoc(doc(db, 'accounts', uid), payload)
}

export { app }
