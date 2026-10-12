/* ============================================================
   POLL — Aggiornamento automatico dei dati
   Ricarica ogni 30 sec; si mette in pausa se la scheda è nascosta
   ============================================================ */

const Poll = {
  timer: null,

  async _esegui(callback) {
    try {
      await callback();
    } catch (e) {
      console.warn('Aggiornamento fallito, riprovo al prossimo giro:', e.message);
    }
  },

  avvia(callback, intervalloMs = 30000) {
    this.ferma();
    this._esegui(callback); // primo aggiornamento subito
    this.timer = setInterval(() => {
      if (document.hidden) return; // scheda in background: salta questo giro
      this._esegui(callback);
    }, intervalloMs);
  },

  ferma() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
};