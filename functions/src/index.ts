import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as express from 'express';
import * as cors from 'cors';
import * as crypto from 'crypto';
import * as cbor from 'cbor';
import base64url from 'base64url';
// Firebase Configs
import { firebaseConfig } from './firebaseConfig';
// Init firebase
admin.initializeApp(firebaseConfig);

// Access to database

// express server
// const { Certificate } = require('@fidm/x509');
// const iso_3166_1 = require('iso-3166-1');
const db = admin.firestore();
const app = express();
const U2F_USER_PRESENTED = 0x01;
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
          const data = { ...req.body, id: id.toJSON() };
          return db.collection('webAuthn').doc(req.body.userName).set(data).then(() => {
            const challengeMakeCred = generateServerMakeCredRequest(req.body.userName, req.body.displayName, id);
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

app.post('/response', (req, res) => {
  if (!req.body || !req.body.id
    || !req.body.rawId || !req.body.response
    || !req.body.type || req.body.type !== 'public-key') {
    res.status(400);
    return res.send({
      'status': 'failed',
      'message': 'Response missing one or more of id/rawId/response/type fields, or type is not public-key!'
    });
  }

  let webauthnResp = req.body;
  return getUserByID(req.body.userID).then((user: any) => {
    console.log('USER: ' + user);
    console.log('REQ ID: ' + req.body.id);
    const id = Buffer.from(user.id.data);
    console.log(id);

    if (id !== webauthnResp.id) {
      res.status(400);
      return res.send({
        'status': 'failed',
        'message': 'Challenges don\'t match!'
      });
    }

    if (webauthnResp.response.attestationObject !== undefined) {
      /* This is create cred */
      const result = verifyAuthenticatorAttestationResponse(webauthnResp);

      if(result.verified) { 
        return res.status(200);
      }

    } else if (webauthnResp.response.authenticatorData !== undefined) {
      /* This is get assertion */
      return res.status(200);
    } else {
      res.status(400);
      return res.json({
        'status': 'failed',
        'message': 'Can not determine type of response!'
      });
    }
    return res.status(500);
  });
});

function verifyAuthenticatorAttestationResponse(webAuthnResponse: any) {
  let attestationBuffer = base64url.toBuffer(webAuthnResponse.response.attestationObject);
  let ctapMakeCredResp = cbor.decodeAllSync(attestationBuffer)[0];

  let response = { 'verified': false } as any;
  if (ctapMakeCredResp.fmt === 'fido-u2f') {
    let authrDataStruct = parseMakeCredAuthData(ctapMakeCredResp.authData);

    if (!(authrDataStruct.flags & U2F_USER_PRESENTED))
      throw new Error('User was NOT presented durring authentication!');

    let clientDataHash = hash(base64url.toBuffer(webAuthnResponse.response.clientDataJSON))
    let reservedByte = Buffer.from([0x00]);
    let publicKey = COSEECDHAtoPKCS(authrDataStruct.COSEPublicKey)
    let signatureBase = Buffer.concat([reservedByte, authrDataStruct.rpIdHash, clientDataHash, authrDataStruct.credID, publicKey]);

    let PEMCertificate = ASN1toPEM(ctapMakeCredResp.attStmt.x5c[0]);
    let signature = ctapMakeCredResp.attStmt.sig;

    response.verified = verifySignature(signature, signatureBase, PEMCertificate)

    if (response.verified) {
      response.authrInfo = {
        fmt: 'fido-u2f',
        publicKey: base64url.encode(publicKey),
        counter: authrDataStruct.counter,
        credID: base64url.encode(authrDataStruct.credID)
      }
    }
  }

  return response
}

function verifySignature(signature: any, data: any, publicKey: any) {
  return crypto.createVerify('SHA256')
      .update(data)
      .verify(publicKey, signature);
}

function ASN1toPEM(pkBuffer: any) {
  if (!Buffer.isBuffer(pkBuffer))
      throw new Error("ASN1toPEM: pkBuffer must be Buffer.")

  let type;
  if (pkBuffer.length == 65 && pkBuffer[0] == 0x04) {
      pkBuffer = Buffer.concat([Buffer.from("3059301306072a8648ce3d020106082a8648ce3d030107034200", "hex"),
          pkBuffer
      ]);

      type = 'PUBLIC KEY';
  } else {
      type = 'CERTIFICATE';
  }

  let b64cert = pkBuffer.toString('base64');

  let PEMKey = '';
  for(let i = 0; i < Math.ceil(b64cert.length / 64); i++) {
      let start = 64 * i;

      PEMKey += b64cert.substr(start, 64) + '\n';
  }

  PEMKey = `-----BEGIN ${type}-----\n` + PEMKey + `-----END ${type}-----\n`;
  
  return PEMKey
}

function COSEECDHAtoPKCS(COSEPublicKey: any) {
  let coseStruct = cbor.decodeAllSync(COSEPublicKey)[0];
  let tag = Buffer.from([0x04]);
  let x   = coseStruct.get(-2);
  let y   = coseStruct.get(-3);

  return Buffer.concat([tag, x, y])
}

function hash(data: any) {
  return crypto.createHash('SHA256').update(data).digest();
}

function parseMakeCredAuthData(buffer: any) {
  let rpIdHash = buffer.slice(0, 32);
  buffer = buffer.slice(32);
  let flagsBuf = buffer.slice(0, 1);
  buffer = buffer.slice(1);
  let flags = flagsBuf[0];
  let counterBuf = buffer.slice(0, 4);
  buffer = buffer.slice(4);
  let counter = counterBuf.readUInt32BE(0);
  let aaguid = buffer.slice(0, 16);
  buffer = buffer.slice(16);
  let credIDLenBuf = buffer.slice(0, 2);
  buffer = buffer.slice(2);
  let credIDLen = credIDLenBuf.readUInt16BE(0);
  let credID = buffer.slice(0, credIDLen);
  buffer = buffer.slice(credIDLen);
  let COSEPublicKey = buffer;

  return { rpIdHash, flagsBuf, flags, counter, counterBuf, aaguid, credID, COSEPublicKey }
}

function getUserByID(id: string): any {
  var userDoc = db.collection('webAuthn').doc(id);
  return userDoc.get().then((doc) => doc.data()).catch(error => error);
}

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
exports.api = functions.https.onRequest(app);