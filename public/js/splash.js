/* ============================================================
   SPLASH SCREEN — Le carte si distribuiscono sul tavolo
   ============================================================ */

(function () {
  const splash = document.getElementById('splash');
  const contenitoreCarte = document.getElementById('carte-splash');
  const titolo = document.getElementById('titolo-splash');
  const bottoneSalta = document.getElementById('salta-splash');

  // Semi delle carte napoletane (♠ ♥ ♦ ♣)
  const SIMBOLI = ['♠', '♥', '♦', '♣'];

  // Genera 8 carte nel centro del tavolo
  const carte = SIMBOLI.concat(SIMBOLI).map((simbolo, i) => {
    const carta = document.createElement('div');
    carta.className = 'carta' + (simbolo === '♥' || simbolo === '♦' ? ' rosso' : '');
    carta.textContent = simbolo;

    // Posizione finale: ventaglio aperto sul tavolo
    const angolo = (i - 3.5) * 16;          // rotazione nel ventaglio
    const x = (i - 3.5) * 70;               // spostamento orizzontale
    const y = Math.abs(i - 3.5) * 12;       // arco del ventaglio

    contenitoreCarte.appendChild(carta);
    return { el: carta, x, y, angolo };
  });

  let completato = false;

  function distribuisci() {
    carte.forEach((carta, i) => {
      setTimeout(() => {
        carta.el.classList.add('distribuita');
        carta.el.style.transform =
          `translate(${carta.x}px, ${carta.y}px) rotate(${carta.angolo}deg) scale(1)`;
      }, 120 * i + 200);
    });

    // Dopo la distribuzione, il titolo "si gira" sopra le carte
    setTimeout(() => {
      titolo.classList.add('visibile');
    }, 120 * carte.length + 700);

    // Chiusura automatica
    setTimeout(chiudi, 120 * carte.length + 2900);
  }

  function chiudi() {
    if (completato) return;
    completato = true;
    splash.classList.add('uscente');
    setTimeout(() => splash.remove(), 900); // rimuove dal DOM dopo il fade
  }

  // Salta con click (utente impaziente 😄)
  bottoneSalta.addEventListener('click', chiudi);

  // Avvia
  distribuisci();
})();