/* ============================================================
   CALENDARIO — Vista lista giorni + dettaglio giorno
   ============================================================ */

const Calendario = (function () {

  let statoCorrente = null;
  let giornoAperto = null;

  const MESI = ['gennaio','febbraio','marzo','aprile','maggio','giugno',
                'luglio','agosto','settembre','ottobre','novembre','dicembre'];
  const GIORNI = ['domenica','lunedì','martedì','mercoledì','giovedì','venerdì','sabato'];

  const NOMI_FASE = {
    girone:       'Girone unico',
    playoff:      'Playoff',
    ottavi:       'Ottavi',
    quarti:       'Quarti',
    semifinali:   'Semifinali',
    finale:       'Finale'
  };

  // ------------------------------------------------------------
  // Utility: formatta "2026-05-15" in "Giovedì 15 maggio 2026"
  // ------------------------------------------------------------
  function formattaData(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    const data = new Date(y, m - 1, d);
    return `${GIORNI[data.getDay()].charAt(0).toUpperCase() + GIORNI[data.getDay()].slice(1)} ${d} ${MESI[m-1]} ${y}`;
  }

  function formattaDataBreve(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return `${String(d).padStart(2,'0')}/${String(m).padStart(2,'0')}/${y}`;
  }

  // ------------------------------------------------------------
  // Raccoglie TUTTE le sfide in un unico array (girone + playoff + tabellone)
  // Ogni sfida ha: id, data, ora, fase, giornata/turno, coppia1, coppia2, risultato, stato
  // ------------------------------------------------------------
  function raccogliSfide(stato) {
    const sfide = [];

    // --- Fase a girone unico ---
    (stato.partite_league || []).forEach(p => {
      sfide.push({
        id: p.id,
        tipo: 'girone',
        fase: 'girone',
        giornata: p.giornata,
        data: p.data || null,        // es. "2026-05-15" — può essere null se non pianificata
        ora: p.ora || null,          // es. "21:00"
        coppia1: p.casa,
        coppia2: p.ospite,
        stato: p.stato || (p.giocata ? 'giocata' : 'programmata'),  // programmata | giocata | rinviata | annullata
        giocata: !!p.giocata,
        mani_casa: p.mani_casa,
        mani_ospite: p.mani_ospite,
        punti_casa: p.punti_casa,
        punti_ospite: p.punti_ospite,
        vincitore: p.vincitore
      });
    });

    // --- Playoff ---
    (stato.playoff || []).forEach(p => {
      sfide.push({
        id: p.id,
        tipo: 'playoff',
        fase: 'playoff',
        giornata: null,
        data: p.data || null,
        ora: p.ora || null,
        coppia1: p.coppia1,
        coppia2: p.coppia2,
        stato: p.stato || (p.giocata ? 'giocata' : 'programmata'),
        giocata: !!p.giocata,
        mani_casa: p.mani_casa,
        mani_ospite: p.mani_ospite,
        punti_casa: p.punti_casa,
        punti_ospite: p.punti_ospite,
        vincitore: p.vincitore
      });
    });

    // --- Tabellone finale ---
    const tab = stato.tabellone || {};
    ['ottavi','quarti','semifinali','finale'].forEach(turno => {
      const lista = tab[turno] || [];
      lista.forEach(p => {
        sfide.push({
          id: p.id || (turno + '-' + (p.coppia1 || '?') + '-' + (p.coppia2 || '?')),
          tipo: turno,
          fase: turno,
          giornata: null,
          data: p.data || null,
          ora: p.ora || null,
          coppia1: p.coppia1,
          coppia2: p.coppia2,
          stato: p.stato || (p.giocata ? 'giocata' : 'programmata'),
          giocata: !!p.giocata,
          mani_casa: p.mani_casa,
          mani_ospite: p.mani_ospite,
          punti_casa: p.punti_casa,
          punti_ospite: p.punti_ospite,
          vincitore: p.vincitore
        });
      });
    });

    return sfide;
  }

  // ------------------------------------------------------------
  // Raggruppa le sfide per data
  // ------------------------------------------------------------
  function raggruppaPerGiorno(sfide) {
    const gruppi = {};
    sfide.forEach(s => {
      if (!s.data) return;      // sfide senza data non compaiono nel calendario
      if (!gruppi[s.data]) gruppi[s.data] = [];
      gruppi[s.data].push(s);
    });
    // Ordina sfide dentro ogni giorno per ora
    Object.values(gruppi).forEach(lista => {
      lista.sort((a, b) => (a.ora || '99:99').localeCompare(b.ora || '99:99'));
    });
    return gruppi;
  }

  // ------------------------------------------------------------
  // Vista LISTA GIORNI
  // ------------------------------------------------------------
  function renderLista(stato) {
    const contenitore = document.getElementById('lista-giorni');
    const sfide = raccogliSfide(stato);
    const gruppi = raggruppaPerGiorno(sfide);
    const giorni = Object.keys(gruppi).sort();

    if (!giorni.length) {
      contenitore.innerHTML = `
        <div class="card-regolamento centro" style="padding: 2.5rem 1.5rem;">
          <h2 style="font-size:1.1rem;">📅 Nessuna sfida programmata</h2>
          <p style="opacity:.75; margin-top:.8rem;">
            Il calendario verrà pubblicato appena l'organizzazione definirà le prime date.
          </p>
        </div>`;
      return;
    }

    // Mappa coppie per nome
    const mapCoppie = {};
    stato.coppie.forEach(c => mapCoppie[c.id] = c);

    let html = '<div class="lista-giorni">';
    giorni.forEach(data => {
      const lista = gruppi[data];
      const giocate = lista.filter(s => s.giocata).length;
      const fasi = [...new Set(lista.map(s => s.fase))];
      const fasiLabel = fasi.map(f => NOMI_FASE[f] || f).join(' · ');

      html += `
        <a href="calendario.html?giorno=${data}" class="card-giorno">
          <div class="card-giorno-data">
            <span class="card-giorno-giorno">${formattaData(data)}</span>
            <span class="card-giorno-fase">${fasiLabel}</span>
          </div>
          <div class="card-giorno-info">
            <span class="card-giorno-count">${lista.length} sfide</span>
            <span class="card-giorno-progress">${giocate}/${lista.length} giocate</span>
          </div>
          <span class="card-giorno-freccia">→</span>
        </a>`;
    });
    html += '</div>';
    contenitore.innerHTML = html;
  }

  // ------------------------------------------------------------
  // Vista DETTAGLIO GIORNO
  // ------------------------------------------------------------
  function renderDettaglio(stato, data) {
    const contenitore = document.getElementById('dettaglio-giorno');
    const sfide = raccogliSfide(stato).filter(s => s.data === data);
    const mapCoppie = {};
    stato.coppie.forEach(c => mapCoppie[c.id] = c);

    if (!sfide.length) {
      contenitore.innerHTML = `
        <div class="card-regolamento centro" style="padding: 2.5rem 1.5rem;">
          <h2 style="font-size:1.1rem;">Nessuna sfida in questa data</h2>
        </div>`;
      return;
    }

    // Ordina per ora
    sfide.sort((a, b) => (a.ora || '99:99').localeCompare(b.ora || '99:99'));

    let html = `
      <div class="centro" style="margin-bottom: 1.5rem;">
        <h1 style="font-size: clamp(1.3rem, 5vw, 2rem);">${formattaData(data)}</h1>
        <p class="sottotitolo" style="margin: .5rem auto 0;">${sfide.length} sfide in programma</p>
      </div>
      <div class="lista-sfide-calendario">`;

    sfide.forEach(s => {
      const c1 = mapCoppie[s.coppia1] || { nome_coppia: '? ? ?', giocatore1:'', giocatore2:'' };
      const c2 = mapCoppie[s.coppia2] || { nome_coppia: '? ? ?', giocatore1:'', giocatore2:'' };

      const faseLabel = NOMI_FASE[s.fase] || s.fase;
      const extra = s.fase === 'girone' && s.giornata ? `Giornata ${s.giornata}` : faseLabel;

      let risultatoHtml = '';
      let classeExtra = '';

      if (s.stato === 'rinviata') {
        classeExtra = 'rinviata';
        risultatoHtml = `<span class="stato-sfida rinviata">Rinviata</span>`;
      } else if (s.stato === 'annullata') {
        classeExtra = 'annullata';
        risultatoHtml = `<span class="stato-sfida annullata">Annullata</span>`;
      } else if (s.giocata) {
        classeExtra = 'giocata';
        const vinc1 = s.vincitore === s.coppia1;
        const vinc2 = s.vincitore === s.coppia2;
        risultatoHtml = `
          <div class="risultato-calendario">
            <span class="mani ${vinc1 ? 'vincente' : ''}">${s.mani_casa}</span>
            <span class="separatore">–</span>
            <span class="mani ${vinc2 ? 'vincente' : ''}">${s.mani_ospite}</span>
          </div>`;
      } else {
        risultatoHtml = `<span class="stato-sfida programmata">Da giocare</span>`;
      }

      html += `
        <div class="sfida-calendario ${classeExtra}">
          <div class="sfida-calendario-header">
            <span class="ora-sfida">${s.ora || '—'}</span>
            <span class="fase-sfida">${extra}</span>
          </div>
          <div class="sfida-calendario-body">
            <div class="squadra-calendario">
              <strong>${c1.nome_coppia}</strong>
              <span>${c1.giocatore1} &amp; ${c1.giocatore2}</span>
            </div>
            <div class="esito-calendario">${risultatoHtml}</div>
            <div class="squadra-calendario destra">
              <strong>${c2.nome_coppia}</strong>
              <span>${c2.giocatore1} &amp; ${c2.giocatore2}</span>
            </div>
          </div>
        </div>`;
    });

    html += '</div>';
    contenitore.innerHTML = html;
  }

  // ------------------------------------------------------------
  // Router interno: lista o dettaglio in base a ?giorno=
  // ------------------------------------------------------------
  function render(stato) {
    statoCorrente = stato;
    const params = new URLSearchParams(window.location.search);
    const giorno = params.get('giorno');

    const vistaLista = document.getElementById('vista-lista');
    const vistaDettaglio = document.getElementById('vista-dettaglio');

    if (giorno) {
      giornoAperto = giorno;
      vistaLista.classList.add('nascosto');
      vistaDettaglio.classList.remove('nascosto');
      renderDettaglio(stato, giorno);
    } else {
      giornoAperto = null;
      vistaLista.classList.remove('nascosto');
      vistaDettaglio.classList.add('nascosto');
      renderLista(stato);
    }
  }

  // ------------------------------------------------------------
  // Init: bottone "indietro"
  // ------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btn-indietro');
    if (btn) {
      btn.addEventListener('click', () => {
        window.location.href = 'calendario.html';
      });
    }
  });

  return { render };
})();