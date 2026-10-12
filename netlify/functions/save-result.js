/* ============================================================
   SAVE-RESULT — Salva il risultato di una partita (solo admin)
   La protezione è lato SERVER: il browser può mentire, qui no.
   ============================================================ */

const { getStore } = require('@netlify/blobs');
const seed = require('../../public/js/dati.js');

exports.handler = async (event) => {
  // --- 1. Solo utenti loggati tramite Netlify Identity ---
  const user = event.context && event.context.clientContext && event.context.clientContext.user;
  if (!user) {
    return { statusCode: 401, body: JSON.stringify({ errore: 'Non autorizzato' }) };
  }

  // --- 2. Leggi e valida l'input ---
  let input;
  try { input = JSON.parse(event.body); }
  catch (e) {
    return { statusCode: 400, body: JSON.stringify({ errore: 'Dati non validi' }) };
  }

  const { id, mani_casa, mani_ospite, punti_casa, punti_ospite } = input;
  const campi = [mani_casa, mani_ospite, punti_casa, punti_ospite];
  if (!id || campi.some(v => !Number.isInteger(v) || v < 0)) {
    return { statusCode: 400, body: JSON.stringify({ errore: 'Valori mancanti o non validi' }) };
  }
  // League phase: si vince a 3 mani → una coppia deve averne esattamente 3
  if (!((mani_casa === 3 && mani_ospite < 3) || (mani_ospite === 3 && mani_casa < 3))) {
    return { statusCode: 400, body: JSON.stringify({ errore: 'La partita si vince a 3 mani' }) };
  }

  // --- 3. Carica lo stato, aggiorna, salva ---
  const store = getStore('briscol-cup');
  let stato = await store.get('stato', { type: 'json' });
  if (!stato) stato = seed; // primo avvio

  const partita = stato.partite_league.find(p => p.id === id);
  if (!partita) {
    return { statusCode: 404, body: JSON.stringify({ errore: 'Partita non trovata' }) };
  }

  partita.giocata = true;
  partita.mani_casa = mani_casa;
  partita.mani_ospite = mani_ospite;
  partita.punti_casa = punti_casa;
  partita.punti_ospite = punti_ospite;
  partita.vincitore = mani_casa > mani_ospite ? partita.casa : partita.ospite;

  await store.setJSON('stato', stato);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, stato })
  };
};