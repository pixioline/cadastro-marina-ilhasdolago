/**
 * Camada de persistência — Firebase Firestore + Storage.
 *
 * Coleção Firestore: "jetskis"
 * Imagens: Firebase Storage em "jetskis/{id}/foto"
 *
 * Estrutura de cada documento:
 * {
 *   id: string (gerado pelo Firestore),
 *   numeroInscricao: string,
 *   marca: string,
 *   modelo: string,
 *   ano: string,
 *   cor: string,
 *   imagemUrl: string | null,   ← URL pública no Storage (não mais base64)
 *   servicos: { quadriciclo: boolean, flutuante: boolean },
 *   proprietarios: [{ id, nome, apartamento, telefone, email }],
 *   dataCadastro: Timestamp,
 *   dataAtualizacao: Timestamp,
 * }
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage } from '../firebase';

const COL = 'jetskis';

// ─── Leitura ────────────────────────────────────────────────────────────────

export async function getAllJetskis() {
  const q = query(collection(db, COL), orderBy('dataCadastro', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Subscription em tempo real com cache offline automático.
 * Retorna a função de cancelamento (unsubscribe).
 * - onData(jetskis[]) — chamada imediatamente com dados do cache, depois com servidor
 * - onError(err)      — chamada se a query falhar
 */
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

// ─── Imagem ──────────────────────────────────────────────────────────────────

/**
 * Recebe um File e faz upload para o Storage.
 * Retorna a URL pública de download.
 */
export async function uploadImagem(jetskiId, file) {
  const storageRef = ref(storage, `jetskis/${jetskiId}/foto`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function deleteImagem(jetskiId) {
  try {
    const storageRef = ref(storage, `jetskis/${jetskiId}/foto`);
    await deleteObject(storageRef);
  } catch {
    // ignora se o arquivo não existir
  }
}

// ─── Escrita ─────────────────────────────────────────────────────────────────

/**
 * Cria um novo jetski. imageFile é opcional (File | null).
 * Retorna o objeto salvo com id.
 */
export async function createJetski(dados, imageFile) {
  // 1. Cria o documento sem imagem para obter o ID
  const docRef = await addDoc(collection(db, COL), {
    ...dados,
    imagemUrl: null,
    dataCadastro: serverTimestamp(),
    dataAtualizacao: serverTimestamp(),
  });

  // 2. Faz upload da imagem se houver e atualiza o documento
  if (imageFile) {
    const url = await uploadImagem(docRef.id, imageFile);
    await updateDoc(docRef, { imagemUrl: url });
    return { id: docRef.id, ...dados, imagemUrl: url };
  }

  return { id: docRef.id, ...dados, imagemUrl: null };
}

/**
 * Atualiza um jetski existente. imageFile pode ser:
 *   - File   → novo arquivo, faz upload e substitui
 *   - null   → remove a imagem existente
 *   - undefined → mantém a imagemUrl atual
 */
export async function updateJetski(id, dados, imageFile) {
  const docRef = doc(db, COL, id);

  let imagemUrl = dados.imagemUrl; // mantém por padrão

  if (imageFile instanceof File) {
    imagemUrl = await uploadImagem(id, imageFile);
  } else if (imageFile === null) {
    await deleteImagem(id);
    imagemUrl = null;
  }

  await updateDoc(docRef, {
    ...dados,
    imagemUrl,
    dataAtualizacao: serverTimestamp(),
  });

  return { id, ...dados, imagemUrl };
}

export async function deleteJetski(id) {
  await deleteImagem(id);
  await deleteDoc(doc(db, COL, id));
}

// ─── Utilitário ───────────────────────────────────────────────────────────────

export function generateId() {
  return `prop_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
