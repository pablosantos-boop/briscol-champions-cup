const { admin } = require('@netlify/identity');

exports.handler = async (event, context) => {
  // 1. Verifica che l'utente sia loggato
  const user = context.clientContext && context.clientContext.user;
  if (!user) {
    return { statusCode: 401, body: JSON.stringify({ errore: 'Non autorizzato' }) };
  }

  // 2. Solo TU puoi chiamarla (se l'email corrisponde alla tua)
  // ⚠️ SOSTITUISCI con la tua email vera
  const TUA_EMAIL = 'vincenzo.amarante@istitutovalfieri.edu.it'; // ← METTI LA TUA EMAIL QUI
  
  if (user.email !== TUA_EMAIL) {
    return { statusCode: 403, body: JSON.stringify({ errore: 'Non sei autorizzato' }) };
  }

  try {
    // 3. Aggiorna il tuo utente aggiungendo il ruolo admin
    const updatedUser = await admin.updateUser(user.sub, {
      app_metadata: {
        roles: ['admin']
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, user: updatedUser })
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ errore: e.message })
    };
  }
};
