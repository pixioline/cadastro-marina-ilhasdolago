import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey:            process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain:        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const db      = getFirestore(app);
export const storage = getStorage(app);

// Persistência offline: na segunda visita a lista carrega do IndexedDB do browser
// antes mesmo da resposta do servidor (~100ms vs ~2s)
enableIndexedDbPersistence(db).catch((err) => {
  // 'failed-precondition': múltiplas abas abertas — persiste só na primeira
  // 'unimplemented': browser não suporta IndexedDB (Safari antigo)
  if (err.code !== 'failed-precondition' && err.code !== 'unimplemented') {
    console.warn('Firestore offline persistence unavailable:', err.code);
  }
});
