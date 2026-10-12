/* ============================================================
   RENDER — Calcola la classifica e la disegna
   ============================================================ */

function calcolaClassifica(stato) {
  const tab = {};
  stato.coppie.forEach(c => {
    tab[c.id] = {
      coppia: c, pg: 0, v: 0, n: 0, p: 0,
      punti: 0, mani_fatte: 0, mani_subite: 0, punti_fatti: 0
    };
  });

  stato.partite_league.forEach(pt => {
    if (!pt.giocata) return;
    const casa = tab[pt.casa], osp = tab[pt.ospite];
    casa.pg++; osp.pg++;
    casa.mani_fatte += pt.mani_casa;  casa.mani_subite += pt.mani_ospite;
    osp.mani_fatte  += pt.mani_ospite; osp.mani_subite  += pt.mani_casa;
    casa.punti_fatti += pt.punti_casa; osp.punti_fatti += pt.punti_ospite;

    if (pt.mani_casa > pt.mani_ospite)      { casa.v++; osp.p++; casa.punti += 3; }
    else if (pt.mani_ospite > pt.mani_casa) { osp.v++; casa.p++; osp.punti += 3; }
    else                                    { casa.n++; osp.n++; casa.punti += 1; osp.punti += 1; }
  });

  return Object.values(tab).sort((a, b) =>
    b.punti - a.punti ||
    (b.mani_fatte - b.mani_subite) - (a.mani_fatte - a.mani_subite) ||
    b.punti_fatti - a.punti_fatti
  );
}

function renderClassifica(stato, contenitore) {
  const classifica = calcolaClassifica(stato);
  const mapCoppie = {};
  stato.coppie.forEach(c => mapCoppie[c.id] = c);

  let html = `
    <div class="card-tabella">
    <table class="tabella">
      <thead>
        <tr>
          <th>#</th><th class="dx">Coppia</th><th>PG</th><th>V</th><th>N</th><th>P</th>
          <th>Mani</th><th>Punti fatti</th><th>Pts</th>
        </tr>
      </thead>
      <tbody>`;

  classifica.forEach((r, i) => {
    const pos = i + 1;
    const zona = pos <= 16 ? 'qualificata' : 'eliminata';
    const dr = r.mani_fatte - r.mani_subite;
    html += `
      <tr class="${zona}">
        <td class="pos">${pos}</td>
        <td class="dx nome-coppia">
          <strong>${r.coppia.nome_coppia}</strong>
          <span class="giocatori">${r.coppia.giocatore1} & ${r.coppia.giocatore2}</span>
        </td>
        <td>${r.pg}</td>
        <td>${r.v}</td>
        <td>${r.n}</td>
        <td>${r.p}</td>
        <td>${dr > 0 ? '+' + dr : dr}</td>
        <td>${r.punti_fatti}</td>
        <td class="punti">${r.punti}</td>
      </tr>`;
  });

  html += `</tbody></table></div>
    <p class="legenda">
      <span class="dot qualificata"></span> Qualificate al tabellone (prime 16)
      <span class="dot eliminata"></span> Eliminata
    </p>`;

  contenitore.innerHTML = html;
}

/* --- Calendario partite (league phase) --- */

function renderTabsGiornate(stato, contenitore, attiva, onClick) {
  let html = '';
  for (let g = 1; g <= 8; g++) {
    const corrente = g === stato.torneo.giornata_corrente;
    html += `<button class="tab-giornata ${g === attiva ? 'attivo' : ''}"
              data-giornata="${g}">${g}${corrente ? ' ·' : ''}</button>`;
  }
  contenitore.innerHTML = html;
  contenitore.querySelectorAll('.tab-giornata').forEach(btn => {
    btn.addEventListener('click', () => onClick(Number(btn.dataset.giornata)));
  });
}

function renderPartite(stato, giornata, contenitore) {
  const map = {};
  stato.coppie.forEach(c => map[c.id] = c);

  const partite = stato.partite_league.filter(p => p.giornata === giornata);

  let html = '<div class="lista-partite">';
  partite.forEach(pt => {
    const casa = map[pt.casa], osp = map[pt.ospite];

    if (pt.giocata) {
      html += `
      <div class="partita giocata">
        <div class="squadra">
          <strong>${casa.nome_coppia}</strong>
          <span>${casa.giocatore1} &amp; ${casa.giocatore2}</span>
        </div>
        <div class="risultato">
          <span class="mani">${pt.mani_casa} – ${pt.mani_ospite}</span>
          <span class="dettaglio">${pt.punti_casa} · ${pt.punti_ospite} pts</span>
        </div>
        <div class="squadra destra">
          <strong>${osp.nome_coppia}</strong>
          <span>${osp.giocatore1} &amp; ${osp.giocatore2}</span>
        </div>
      </div>`;
    } else {
      html += `
      <div class="partita">
        <div class="squadra">
          <strong>${casa.nome_coppia}</strong>
          <span>${casa.giocatore1} &amp; ${casa.giocatore2}</span>
        </div>
        <div class="risultato da-giocare">
          <span class="vs">VS</span>
          <span class="dettaglio">da giocare</span>
        </div>
        <div class="squadra destra">
          <strong>${osp.nome_coppia}</strong>
          <span>${osp.giocatore1} &amp; ${osp.giocatore2}</span>
        </div>
      </div>`;
    }
  });
  html += '</div>';
  contenitore.innerHTML = html;
}

/* --- Tabellone eliminatorio --- */

const MANI_PER_TURNO = { sedicesimi: 3, ottavi: 3, quarti: 4, semifinali: 5, finale: 6 };
const NOMI_TURNI = { sedicesimi: 'Sedicesimi', ottavi: 'Ottavi', quarti: 'Quarti', semifinali: 'Semifinali', finale: 'Finale' };
const SLOT_TURNI = { sedicesimi: 8, ottavi: 8, quarti: 4, semifinali: 2, finale: 1 };

function renderTabellone(stato, contenitore) {
  const classifica = calcolaClassifica(stato);
  const squadra = {};
  stato.coppie.forEach(c => squadra[c.id] = c);

  function info(id) {
    if (!id || !squadra[id]) return { nome: '? ? ?', dett: 'in attesa' };
    const c = squadra[id];
    return { nome: c.nome_coppia, dett: c.giocatore1 + ' & ' + c.giocatore2 };
  }

  // Costruzione turni: dati reali se presenti, altrimenti proiezione dalla classifica
  const tab = stato.tabellone || {};
  const turni = {};
  const ordine = ['sedicesimi', 'ottavi', 'quarti', 'semifinali', 'finale'];

  if (tab.sedicesimi && tab.sedicesimi.length) {
    ordine.forEach(t => turni[t] = tab[t] || []);
  } else {
    // PROIEZIONE: 1ª vs 16ª, 2ª vs 15ª, ... 8ª vs 9ª
    turni.sedicesimi = [];
    for (let i = 0; i < 8; i++) {
      turni.sedicesimi.push({
        coppia1: classifica[i].coppia.id,
        coppia2: classifica[15 - i].coppia.id,
        giocata: false
      });
    }
    ['ottavi', 'quarti', 'semifinali'].forEach(t => turni[t] = []);
    turni.finale = [];
  }

  // --- Disegno ---
  let html = '<div class="tabellone">';
  const proiezione = !(tab.sedicesimi && tab.sedicesimi.length);

  ordine.forEach((t, idx) => {
    const mani = MANI_PER_TURNO[t];
    html += `<div class="colonna-turno ${t}">
      <h3>${NOMI_TURNI[t]}</h3>
      <p class="mani-turno">prima a ${mani} mani</p>`;

    const partite = turni[t];
    const slot = (t === 'ottavi' && proiezione) ? SLOT_TURNI.sedicesimi : SLOT_TURNI[t];

    if (!partite.length) {
      // turno ancora da definire
      for (let i = 0; i < slot; i++) {
        html += `<div class="match-bracket vuoto">
          <div class="lato"><span class="nome">? ? ?</span></div>
          <div class="lato"><span class="nome">? ? ?</span></div>
        </div>`;
      }
    } else {
      partite.forEach(pt => {
        const a = info(pt.coppia1), b = info(pt.coppia2);
        const vinta = pt.giocata;
        const vincA = vinta && pt.vincitore === pt.coppia1;
        const vincB = vinta && pt.vincitore === pt.coppia2;
        html += `<div class="match-bracket ${vinta ? 'giocata' : ''}">
          <div class="lato ${vincA ? 'vincitore' : ''}">
            <span class="nome">${a.nome}</span>
            <span class="mani">${vinta ? pt.mani_casa : ''}</span>
          </div>
          <div class="lato ${vincB ? 'vincitore' : ''}">
            <span class="nome">${b.nome}</span>
            <span class="mani">${vinta ? pt.mani_ospite : ''}</span>
          </div>
        </div>`;
      });
    }
    html += '</div>';
  });
  html += '</div>';

  contenitore.innerHTML = html +
    (proiezione
      ? '<p class="nota-tabellone">📋 Proiezione basata sulla classifica attuale — il tabellone ufficiale si sblocca al termine della fase a campionato.</p>'
      : '');
}

/* --- Pagina coppie --- */

function renderCoppie(stato, contenitore) {
  const stats = {};
  stato.coppie.forEach(c => stats[c.id] = { pg: 0, v: 0, punti: 0 });

  stato.partite_league.forEach(pt => {
    if (!pt.giocata) return;
    stats[pt.casa].pg++; stats[pt.ospite].pg++;
    stats[pt.casa].punti += pt.punti_casa;
    stats[pt.ospite].punti += pt.punti_ospite;
    stats[pt.vincitore].v++;
  });

  let html = '<div class="griglia-coppie">';
  stato.coppie.forEach((c, i) => {
    const s = stats[c.id];
    html += `
    <div class="card-coppia">
      <div class="numero-coppia">${String(i + 1).padStart(2, '0')}</div>
      <h3>${c.nome_coppia}</h3>
      <p class="giocatori-coppia">${c.giocatore1}<br>&amp;<br>${c.giocatore2}</p>
      <div class="stats-coppia">
        <span><strong>${s.pg}</strong> giocate</span>
        <span><strong>${s.v}</strong> vinte</span>
        <span><strong>${s.punti}</strong> punti fatti</span>
      </div>
    </div>`;
  });
  html += '</div>';
  contenitore.innerHTML = html;
}