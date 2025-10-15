import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

export async function addRunForUser(userId, run) {
  const colRef = collection(db, 'users', userId, 'runs')
  const payload = {
    distance: run.distanceMeters,
    time: run.durationSec,
    pace: run.paceMinPerKm,
    elevation: run.elevationGain,
    date: run.date,
    createdAt: serverTimestamp(),
  }
  const ref = await addDoc(colRef, payload)
  return { id: ref.id, ...payload }
}

export async function listRunsForUser(userId) {
  const colRef = collection(db, 'users', userId, 'runs')
  const q = query(colRef)
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function deleteRun(userId, runId) {
  const ref = doc(db, 'users', userId, 'runs', runId)
  await deleteDoc(ref)
}


