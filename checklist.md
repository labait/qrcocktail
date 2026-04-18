# QRCocktail — Checklist Progetto

## Flusso Utente (Phase-based)

| # | Phase | Stato |
|---|-------|-------|
| 1 | **qrcode** — Scansione QR code (3 richiesti, validati vs Firestore, no duplicati) | ✅ |
| 2 | **quiz** — 5 domande, max 1 errore consentito | ✅ |
| 3 | **redeem** — QR code personale per il manager, erogazione cocktail | ✅ |
| 4 | **thanks** — Schermata di ringraziamento post-erogazione | ✅ |
| 5 | **lost** — Schermata di sconfitta (errori quiz superati) | ✅ |

---

## Infrastruttura

- [x] Vue 3 + Vite + Vue Router
- [x] Firebase Auth (Google Sign-In)
- [x] Firebase Firestore (`accounts`, `qrcodes`)
- [x] Netlify Functions (generazione quiz via OpenAI)
- [x] Tailwind CSS v4

---

## Admin / Manager

- [x] CRUD QR codes (lista, crea, modifica, elimina)
- [x] Admin Guard (protezione rotte)
- [x] Pagina redeem protetta per manager

---

## Da completare (nice-to-have)

- [ ] Toast/snackbar per feedback azioni
- [ ] PWA (installable)
- [ ] Analytics
- [ ] Dark mode completo

---

Ultimo aggiornamento: **18 Aprile 2026**
Stato progetto: **~90% completato** — flusso utente completo end-to-end
