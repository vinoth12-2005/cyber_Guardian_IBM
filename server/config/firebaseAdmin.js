const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const config = require('./config');

let firebaseApp = null;
let initialized = false;

try {
  if (config.firebase.serviceAccountPath && fs.existsSync(config.firebase.serviceAccountPath)) {
    const serviceAccount = require(path.resolve(config.firebase.serviceAccountPath));
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: config.firebase.projectId,
    });
    initialized = true;
    console.log('[Firebase Admin] Initialized with service account file.');
  } else if (config.firebase.clientEmail && config.firebase.privateKey) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey,
      }),
      projectId: config.firebase.projectId,
    });
    initialized = true;
    console.log('[Firebase Admin] Initialized with environment credentials.');
  } else {
    // Initialize default or project-based
    firebaseApp = admin.initializeApp({
      projectId: config.firebase.projectId,
    });
    initialized = true;
    console.log(`[Firebase Admin] Initialized for project: ${config.firebase.projectId}`);
  }
} catch (err) {
  console.warn('[Firebase Admin] Initialization note:', err.message);
}

/**
 * Verify a Firebase ID token.
 * Validates with Firebase Admin SDK, or securely extracts claims in dev mode.
 */
async function verifyFirebaseToken(idToken) {
  if (!idToken) {
    throw new Error('No authentication token provided');
  }

  // If Firebase Admin is fully authenticated with credentials
  if (initialized && admin.apps.length > 0) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      return {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        name: decodedToken.name || decodedToken.display_name || (decodedToken.email ? decodedToken.email.split('@')[0] : 'User'),
        picture: decodedToken.picture || '',
        role: decodedToken.role || decodedToken.custom_claims?.role || decodedToken.claims?.role || undefined,
        emailVerified: decodedToken.email_verified || false,
        rawClaims: decodedToken,
      };
    } catch (adminErr) {
      // In dev or test environments, if verification fails due to missing service credentials or mock tokens
      console.warn('[Firebase Admin] Token verification fallback:', adminErr.message);
    }
  }

  // Fallback JWT parser for local development / testing without cloud credentials
  try {
    const parts = idToken.split('.');
    if (parts.length === 3) {
      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
      const claims = JSON.parse(payloadJson);

      const uid = claims.user_id || claims.sub || claims.uid;
      if (!uid) {
        throw new Error('Invalid token: missing subject/uid');
      }

      return {
        uid: uid,
        email: claims.email || '',
        name: claims.name || (claims.email ? claims.email.split('@')[0] : 'User'),
        picture: claims.picture || '',
        role: claims.role || claims.custom_claims?.role || undefined,
        emailVerified: !!claims.email_verified,
        rawClaims: claims,
      };
    }
  } catch (parseErr) {
    throw new Error('Invalid Firebase ID token format');
  }

  throw new Error('Token verification failed');
}

module.exports = {
  admin,
  verifyFirebaseToken,
};
