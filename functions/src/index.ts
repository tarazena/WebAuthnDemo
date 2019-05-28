import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as express from 'express';
import * as cors from 'cors';
import * as crypto from 'crypto';
// import * as textEncoder from 'text-encoding';
// import base64url from 'base64url';
// Firebase Configs
import { firebaseConfig } from './firebaseConfig';

// Init firebase
admin.initializeApp(firebaseConfig);

// Access to database
var db = admin.firestore();

// express server
const app = express();

// adding cors
app.use(cors({ origin: true }));

// using parser
app.use(express.json());

app.post('/register', (req, res) => {
  if (req && req.body && req.body.displayName && req.body.userName) {
    if (req.body.password) {
      return checkIfUserExists(req.body.userName, 'normalAuth').then((exists) => {
        if (exists) {
          res.status(409);
          return res.send('User is already registered');
        } else {
          return db.collection('normalAuth').doc(req.body.userName).set(req.body).then(() => {
            return res.send(`created ${req.body.userName}`);
          }).catch(() => {
            res.status(500);
            return res.send("Error in Registering the user");
          });
        }
      });
    } else {
      return checkIfUserExists(req.body.userName, 'webAuthn').then((exists) => {
        if (exists) {
          res.status(409);
          return res.send('User is already registered');
        } else {
          const id = crypto.randomBytes(32);
          const data = { ...req.body, id: id };
          return db.collection('webAuthn').doc(req.body.userName).set(data).then(() => {
            const challengeMakeCred = generateServerMakeCredRequest(req.body.userName, req.body.displayName, data.id);
            challengeMakeCred.status = 'ok';
            return res.json(challengeMakeCred);
          }).catch((err) => {
            res.status(500);
            return res.send("Error in Registering the user, error: " + err);
          });
        }
      });
    }
  }
  res.status(400);
  return res.send('Bad Request');
});

function checkIfUserExists(user: string, dbCollection: string): Promise<boolean> {
  var userDoc = db.collection(dbCollection).doc(user);
  return userDoc.get().then((doc) => doc.exists).catch((error) => {
    console.log(error);
    return false;
  });

}

function generateServerMakeCredRequest(username: string, displayName: string, id: Buffer): any {
  return {
    challenge: crypto.randomBytes(32),
    rp: {
      name: "WebAuthn Example"
    },
    user: {
      id: id,
      name: username,
      displayName: displayName
    },
    pubKeyCredParams: [
      {
        type: "public-key", alg: -7 // "ES256" IANA COSE Algorithms registry
      }
    ]
  }
}

// Exposing Server
exports.widgets = functions.https.onRequest(app);