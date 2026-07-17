// src/lib/firestore.ts
// Helpers mínimos para usar Firestore desde el cliente (web)
import { db } from '../firebase';
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, query, where } from 'firebase/firestore';

export async function fetchCollection(name: string) {
  const col = collection(db, name);
  const snap = await getDocs(col);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addDocument(name: string, data: any) {
  const ref = await addDoc(collection(db, name), data);
  return ref.id;
}

export async function getDocumentById(name: string, id: string) {
  const ref = doc(db, name, id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateDocument(name: string, id: string, data: any) {
  const ref = doc(db, name, id);
  await updateDoc(ref, data);
}

export async function queryCollection(name: string, field: string, op: any, value: any) {
  const q = query(collection(db, name), where(field, op, value));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
