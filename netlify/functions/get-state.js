/* Legge lo stato torneo da Netlify Blobs; se non esiste, lo crea dai seed */
const { getStore } = require('@netlify/blobs');
const seed = require('../../public/js/dati.js');

exports.handler = async () => {
  const store = getStore('briscol-cup');
  let stato = await store.get('stato', { type: 'json' });
  if (!stato) {
    stato = seed;
    await store.setJSON('stato', stato);
  }
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(stato)
  };
};