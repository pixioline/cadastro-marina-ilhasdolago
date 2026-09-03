import {
  collection, doc, getDoc, addDoc, updateDoc, deleteDoc,
  orderBy, query, serverTimestamp, onSnapshot,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';

const COL = 'jetskis';

export function subscribeJetskis(onData, onError) {
  const q = query(collection(db, COL), orderBy('dataCadastro', 'desc'));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
}

export async function getJetskiById(id) {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function uploadImagem(jetskiId, file) {
  const storageRef = ref(storage, `jetskis/${jetskiId}/foto`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function deleteImagem(jetskiId) {
  try { await deleteObject(ref(storage, `jetskis/${jetskiId}/foto`)); } catch { }
}

export async function createJetski(dados, imageFile) {
  const docRef = await addDoc(collection(db, COL), {
    ...dados, imagemUrl: null,
    dataCadastro: serverTimestamp(),
    dataAtualizacao: serverTimestamp(),
  });
  if (imageFile) {
    const url = await uploadImagem(docRef.id, imageFile);
    await updateDoc(docRef, { imagemUrl: url });
    return { id: docRef.id, ...dados, imagemUrl: url };
  }
  return { id: docRef.id, ...dados, imagemUrl: null };
}

export async function updateJetski(id, dados, imageFile) {
  const docRef = doc(db, COL, id);
  let imagemUrl = dados.imagemUrl;
  if (imageFile instanceof File) {
    imagemUrl = await uploadImagem(id, imageFile);
  } else if (imageFile === null) {
    await deleteImagem(id);
    imagemUrl = null;
  }
  await updateDoc(docRef, { ...dados, imagemUrl, dataAtualizacao: serverTimestamp() });
  return { id, ...dados, imagemUrl };
}

export async function deleteJetski(id) {
  await deleteImagem(id);
  await deleteDoc(doc(db, COL, id));
}

export function generateId() {
  return `prop_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
