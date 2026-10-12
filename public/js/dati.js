/* ============================================================
   DATI SEED — 24 coppie fittizie + calendario + risultati fake
   Funziona nel browser (window.DATI_SEED) e su Node (module.exports)
   ============================================================ */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.DATI_SEED = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  // --- Le 24 coppie (formato: NOME SQUADRA - Giocatore 1 e Giocatore 2) ---
  const ELENCO = [
    ['I Re di Denari',        'Marco Bellini',    'Davide Serra'],
    ['Le Briscole Volanti',   'Alessio Greco',    'Simone Vitale'],
    ['Gli Assi di Bastoni',   'Francesco Marchetti', 'Andrea Colombo'],
    ['Le Coppe d\'Oro',       'Luigi Romano',     'Paolo Gentile'],
    ['I Spadaccini',          'Enrico Ferri',     'Roberto Gallo'],
    ['I Settebelli',          'Tommaso Ricci',    'Matteo Barbieri'],
    ['I Cartai',              'Giuseppe Moretti', 'Stefano Rinaldi'],
    ['Le Vecchie Glorie',     'Antonio De Luca',  'Vincenzo Esposito'],
    ['I Fuori Sede',          'Lorenzo Fontana',  'Andrea Caruso'],
    ['Gli Scartini',          'Filippo Martini',  'Emanuele Rizzo'],
    ['Le Tre Spade',          'Nicola Santoro',   'Marco Giordano'],
    ['I Cavalieri di Coppe',  'Daniele Mancini',  'Fabio Riva'],
    ['I Duri di Fegato',      'Sergio Longo',     'Claudio Ferraro'],
    ['Le Stelle di Napoli',   'Carmine Bruno',    'Salvatore Parisi'],
    ['I Bussatori',           'Alessandro Vitto', 'Giorgio Leone'],
    ['Le Aquile',             'Mauro Silvestri',  'Ivan Gatti'],
    ['I Fenomeni',            'Omar Said',        'Christian Neri'],
    ['Gli Ultimi Arrivati',   'Pietro Galli',     'Marco Orlando'],
    ['Le Cariche',            'Dario Pellegrini', 'Luca Sanna'],
    ['I Mastri Briscolai',    'Vittorio Amato',   'Rocco De Santis'],
    ['I Diavoli del Tavolo',  'Mirko Canali',     'Ivan Petrov'],
    ['I Capitani di Ventura', 'Sergio Basile',    'Aldo Mariani'],
    ['Gli Smeraldi',          'Ezio Fabbri',      'Nino Costanzo'],
    ['Le Quattro Coppe',      'Renzo Battaglia',  'Elio Sartori'],
  ];

  const coppie = ELENCO.map((e, i) => ({
    id: 'c' + String(i + 1).padStart(3, '0'),
    nome_coppia: e[0],
    giocatore1: e[1],
    giocatore2: e[2],
    foto: null,
    iscritta: true
  }));

  // --- Generatore pseudo-casuale deterministico (risultati fake stabili) ---
  function prand(seed) {
    const x = Math.sin(seed * 9997) * 10000;
    return x - Math.floor(x);
  }

  // --- Calendario: 8 giornate con metodo del cerchio (girone all'italiana) ---
  const ids = coppie.map(c => c.id);
  const ruota = ids.slice();
  const partite_league = [];

  for (let g = 1; g <= 8; g++) {
    for (let i = 0; i < ids.length / 2; i++) {
      const a = ruota[i];
      const b = ruota[ids.length - 1 - i];
      const casa = (g + i) % 2 === 0 ? a : b;
      const ospite = casa === a ? b : a;
      const seed = g * 100 + i;

      const partita = {
        id: 'L' + g + '-' + i,
        giornata: g,
        casa, ospite,
        giocata: g <= 2,               // prime 2 giornate "già giocate"
        mani_casa: null, mani_ospite: null,
        punti_casa: null, punti_ospite: null,
        vincitore: null
      };

      if (partita.giocata) {
        const r = prand(seed);
        const vincitoreCasa = r < 0.5;
        const maniPerse = Math.floor(prand(seed + 1) * 3); // 0, 1 o 2
        partita.mani_casa    = vincitoreCasa ? 3 : maniPerse;
        partita.mani_ospite  = vincitoreCasa ? maniPerse : 3;
        partita.punti_casa   = Math.round(150 + prand(seed + 2) * 300);
        partita.punti_ospite = Math.round(150 + prand(seed + 3) * 300);
        partita.vincitore = vincitoreCasa ? casa : ospite;
      }

      partite_league.push(partita);
    }
    ruota.splice(1, 0, ruota.pop()); // ruota tenendo fissa la prima squadra
  }

  return {
    torneo: {
      nome: 'Briscol Champions Cup',
      stagione: '2026',
      fase: 'league',            // league | tabellone | finale | concluso
      giornata_corrente: 3
    },
    coppie,
    partite_league,
    tabellone: { sedicesimi: [], ottavi: [], quarti: [], semifinali: [], finale: null },
    albo_doro: []
  };
});