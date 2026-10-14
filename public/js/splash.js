/* ============================================================
   SPLASH SCREEN — Le 4 carte ti arrivano addosso, una per volta,
   poi si allineano in fila e appare il titolo.
   ============================================================ */

(function () {
  const splash = document.getElementById('splash');
  const contenitore = document.getElementById('carte-splash');
  const titolo = document.getElementById('titolo-splash');
  const bottoneSalta = document.getElementById('salta-splash');

  // Le tue 4 immagini (assi)
  const CARTE = [
    { src: 'images/AssoBastoni.jpg', alt: 'Asso di Bastoni' },
    { src: 'images/AssoSpade.jpg',   alt: 'Asso di Spade'   },
    { src: 'images/AssoCoppe.jpg',   alt: 'Asso di Coppe'   },
    { src: 'images/AssoDenari.jpg',  alt: 'Asso di Denari'  }
  ];

  // Posizione finale: le 4 carte in fila, leggermente a ventaglio
  // Calcoliamo offset in base alla larghezza dello schermo
  const larghezza = Math.min(window.innerWidth, 480);
  const stepX = larghezza * 0.19;           // distanza tra le carte
  const rotazioni = [-12, -4, 4, 12];       // gradi per ogni carta
  const offsetsY = [10, -4, -4, 10];        // leggero arco

  const carte = [];

  CARTE.forEach((dato, i) => {
    const carta = document.createElement('div');
    carta.className = 'carta-splash';
    carta.innerHTML = `<img src="${dato.src}" alt="${dato.alt}" draggable="false">`;

    // Posizione finale (quella che avrà a fine animazione)
    const xFinale = (i - 1.5) * stepX;
    const yFinale = offsetsY[i];
    const rotFinale = rotazioni[i];

    // Posizione iniziale: fuori schermo, in alto, piccolissima
    // → dà l'effetto "arriva addosso"
    carta.style.setProperty('--x-in', '0px');
    carta.style.setProperty('--y-in', '-120vh');
    carta.style.setProperty('--s-in', '0.15');
    carta.style.setProperty('--r-in', '0deg');

    carta.dataset.xFinale = xFinale;
    carta.dataset.yFinale = yFinale;
    carta.dataset.rotFinale = rotFinale;

    contenitore.appendChild(carta);
    carte.push(carta);
  });

  let completato = false;

  function anima() {
    // Una carta per volta: ogni 380ms parte la successiva
    carte.forEach((carta, i) => {
      setTimeout(() => {
        const x = carta.dataset.xFinale;
        const y = carta.dataset.yFinale;
        const r = carta.dataset.rotFinale;

        carta.style.setProperty('--x-out', x + 'px');
        carta.style.setProperty('--y-out', y + 'px');
        carta.style.setProperty('--s-out', '1');
        carta.style.setProperty('--r-out', r + 'deg');
        carta.classList.add('arrivata');
      }, 350 * i + 200);
    });

    // Dopo l'ultima carta, appare il titolo
    const fineCarte = 350 * carte.length + 200 + 700;
    setTimeout(() => titolo.classList.add('visibile'), fineCarte);

    // Chiusura automatica
    setTimeout(chiudi, fineCarte + 1800);
  }

  function chiudi() {
    if (completato) return;
    completato = true;
    splash.classList.add('uscente');
    setTimeout(() => splash.remove(), 900);
  }

  bottoneSalta.addEventListener('click', chiudi);

  // Aspetta che le immagini siano caricate (max 1.5s) poi parte
  let pronte = 0;
  const timeout = setTimeout(anima, 1500);
  carte.forEach(carta => {
    const img = carta.querySelector('img');
    const done = () => {
      pronte++;
      if (pronte === carte.length) {
        clearTimeout(timeout);
        setTimeout(anima, 100);
      }
    };
    if (img.complete) done();
    else { img.addEventListener('load', done); img.addEventListener('error', done); }
  });
})();