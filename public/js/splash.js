/* ============================================================
   SPLASH SCREEN — appare solo la prima volta per sessione
   ============================================================ */

(function () {
  const splash = document.getElementById('splash');
  if (!splash) return;

  // Se lo splash è già stato mostrato in questa sessione, rimuovilo subito
  if (sessionStorage.getItem('bcc_splash_vista') === '1') {
    splash.remove();
    return;
  }

  const contenitore = document.getElementById('carte-splash');
  const titolo = document.getElementById('titolo-splash');
  const bottoneSalta = document.getElementById('salta-splash');

  const CARTE = [
    { src: 'images/AssoBastoni.jpg', alt: 'Asso di Bastoni' },
    { src: 'images/AssoSpade.jpg',   alt: 'Asso di Spade'   },
    { src: 'images/AssoCoppe.jpg',   alt: 'Asso di Coppe'   },
    { src: 'images/AssoDenari.jpg',  alt: 'Asso di Denari'  }
  ];

  const larghezza = Math.min(window.innerWidth, 480);
  const stepX = larghezza * 0.19;
  const rotazioni = [-12, -4, 4, 12];
  const offsetsY = [10, -4, -4, 10];

  const carte = [];

  CARTE.forEach((dato, i) => {
    const carta = document.createElement('div');
    carta.className = 'carta-splash';
    carta.innerHTML = `<img src="${dato.src}" alt="${dato.alt}" draggable="false">`;

    carta.style.setProperty('--x-in', '0px');
    carta.style.setProperty('--y-in', '-120vh');
    carta.style.setProperty('--s-in', '0.15');
    carta.style.setProperty('--r-in', '0deg');

    carta.dataset.xFinale = (i - 1.5) * stepX;
    carta.dataset.yFinale = offsetsY[i];
    carta.dataset.rotFinale = rotazioni[i];

    contenitore.appendChild(carta);
    carte.push(carta);
  });

  let completato = false;

  function anima() {
    carte.forEach((carta, i) => {
      setTimeout(() => {
        carta.style.setProperty('--x-out', carta.dataset.xFinale + 'px');
        carta.style.setProperty('--y-out', carta.dataset.yFinale + 'px');
        carta.style.setProperty('--s-out', '1');
        carta.style.setProperty('--r-out', carta.dataset.rotFinale + 'deg');
        carta.classList.add('arrivata');
      }, 350 * i + 200);
    });

    const fineCarte = 350 * carte.length + 200 + 700;
    setTimeout(() => titolo.classList.add('visibile'), fineCarte);
    setTimeout(chiudi, fineCarte + 1800);
  }

  function chiudi() {
    if (completato) return;
    completato = true;
    sessionStorage.setItem('bcc_splash_vista', '1');
    splash.classList.add('uscente');
    setTimeout(() => splash.remove(), 900);
  }

  bottoneSalta.addEventListener('click', chiudi);

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