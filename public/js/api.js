/* ============================================================
   API — Legge lo stato del torneo
   Su Netlify: chiama la funzione. In locale: usa i dati seed.
   ============================================================ */

const API = {
  async getState() {
    try {
      const res = await fetch('/.netlify/functions/get-state');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
        } catch (e) {
      // Modalità locale: prima guardo in localStorage, poi nei seed
      console.info('Modalità locale (dati seed):', e.message);
      const salvato = localStorage.getItem('bcc_stato');
      if (salvato) {
        try { return JSON.parse(salvato); } catch (_) { /* dati corrotti, uso i seed */ }
      }
      return typeof DATI_SEED !== 'undefined' ? DATI_SEED : null;
    }
  }
};