/**
 * Camada de persistência baseada em localStorage com estrutura JSON.
 * Não requer banco de dados externo.
 */

const STORAGE_KEY = 'marina_jetskis';

export const initialData = {
  jetskis: [],
};

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...initialData, jetskis: [] };
    return JSON.parse(raw);
  } catch {
    return { ...initialData, jetskis: [] };
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getAllJetskis() {
  return loadData().jetskis;
}

export function getJetskiById(id) {
  return getAllJetskis().find((j) => j.id === id) || null;
}

export function saveJetski(jetski) {
  const data = loadData();
  const idx = data.jetskis.findIndex((j) => j.id === jetski.id);
  if (idx >= 0) {
    data.jetskis[idx] = jetski;
  } else {
    data.jetskis.push(jetski);
  }
  saveData(data);
  return jetski;
}

export function deleteJetski(id) {
  const data = loadData();
  data.jetskis = data.jetskis.filter((j) => j.id !== id);
  saveData(data);
}

export function generateId() {
  return `jsk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Estrutura de um jetski:
 * {
 *   id: string,
 *   numeroInscricao: string,
 *   marca: string,
 *   modelo: string,
 *   ano: string,
 *   cor: string,
 *   imagemBase64: string | null,
 *   servicos: {
 *     quadriciclo: boolean,
 *     flutuante: boolean,
 *   },
 *   proprietarios: [
 *     {
 *       id: string,
 *       nome: string,
 *       apartamento: string,
 *       telefone: string,
 *       email: string,
 *     }
 *   ],
 *   dataCadastro: string (ISO),
 *   dataAtualizacao: string (ISO),
 * }
 */
