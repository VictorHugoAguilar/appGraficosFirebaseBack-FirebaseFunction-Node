import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp(
    {
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://appgrafica-5022c.firebaseio.com"
    }
);

// referencia a la bd

const db = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

export const helloWorld = functions.https.onRequest((request, response) => {
    response.json({
        "OK": true,
        "code-status": 200,
        "Message": "Hello from Firebase!",
    });
});

export const getGoty = functions.https.onRequest(async (request, response) => {
    //const nombre = request.query.nombre || 'Sin nombre';
    //response.json({ nombre});
    const gotyRef = db.collection('goty');
    const docsSnap = await gotyRef.get();
    const juegos = docsSnap.docs.map(doc => doc.data());
    response.json(juegos)
});

// Express básico
const app = express();
app.use(cors({ origin: true }));

app.get('/goty', async (req, resp) => {
    const gotyRef = db.collection('goty');
    const docsSnap = await gotyRef.get();
    const juegos = docsSnap.docs.map(doc => doc.data());
    resp.json(juegos);
});

app.post('/goty/:id', async (req, resp) => {
    const id = req.params.id;
    const gameRef = db.collection('goty').doc(id);

    const gameSnap = await gameRef.get();

    if (!gameSnap.exists) {
        return resp.status(404).json({
            ok: false,
            mensaje: `No existe juego con ese id ${id}`
        });
    }

    const antes = gameSnap.data() || { votos: 0 };

    await gameRef.update({
        votos: antes.votos + 1
    });

    resp.json({
        ok: true,
        mensaje: `Gracias por tu voto a ${antes.name}`
    });
});

export const api = functions.https.onRequest(app);


