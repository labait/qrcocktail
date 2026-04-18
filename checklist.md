# QRCocktail — Checklist Progetto

## Flusso Utente (Phase-based)

| # | Phase | Descrizione | Stato |
|---|-------|-------------|-------|
| 1 | **qrcode** | Scansione QR code (3 richiesti, validati vs Firestore, no duplicati con fresh-read DB) | ✅ |
| 2 | **quiz** | 5 domande random da pool locale di 30, max 1 errore | ✅ |
| 3 | **redeem** | Coupon QR univoco (UUID) generato automaticamente per l'utente | ✅ |
| 4 | **thanks** | Schermata ringraziamento post-erogazione da parte del manager | ✅ |
| 5 | **lost** | Schermata sconfitta (errori quiz superati) | ✅ |

---

## Manager / Admin

- [x] Scanner coupon dedicato nel pannello admin
- [x] Pagina `/users/:uid/redeem` protetta da admin guard
- [x] Validazione coupon_code prima dell'erogazione
- [x] Transizione `phase: 'thanks'` alla conferma

---

## Infrastruttura

- [x] Vue 3 + Vite + Vue Router
- [x] Firebase Auth (Google Sign-In)
- [x] Firebase Firestore (`accounts`, `qrcodes`)
- [x] Pool domande locale (`quiz_pool.json`, 30 domande)
- [x] Tailwind CSS v4

---

## Schema Firestore `accounts/{uid}`

```json
{
  "uid": "string",
  "roles": [],
  "phase": "qrcode | quiz | redeem | thanks | lost",
  "qrcodes": ["code1", "code2", ...],
  "coupon_code": "uuid | null"
}
```

---

## Da completare (nice-to-have)

- [ ] Toast/snackbar per feedback azioni
- [ ] PWA (installable)
- [ ] Analytics
- [ ] Dark mode completo

---

Ultimo aggiornamento: **18 Aprile 2026**
Stato progetto: **~95% completato** — flusso utente end-to-end con coupon univoco
