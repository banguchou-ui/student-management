/**
 * firebaseService.ts
 * Firebase Firestore との接続層
 * USE_FIREBASE = false の間はローカルストレージを使用
 * USE_FIREBASE = true にすると Firestore に切り替わる
 */

import { Student, User, UserRole } from '../types';
import { USE_FIREBASE, firebaseConfig } from '../firebase.config';
import {
  getStoredStudents,
  saveStoredStudents,
  getStoredUsers,
  saveStoredUsers,
  initUsers,
} from './storageService';

// Lazy-load Firebase to avoid errors when USE_FIREBASE = false
let db: any = null;
let auth: any = null;

async function getFirebase() {
  if (!USE_FIREBASE) return { db: null, auth: null };
  if (db) return { db, auth };

  const { initializeApp, getApps } = await import('firebase/app');
  const { getFirestore } = await import('firebase/firestore');
  const { getAuth } = await import('firebase/auth');

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app);
  auth = getAuth(app);
  return { db, auth };
}

// ─── Student Operations ───────────────────────────────────────

export async function fetchStudents(schoolId: string = 'default'): Promise<Student[]> {
  if (!USE_FIREBASE) {
    return getStoredStudents();
  }
  const { db } = await getFirebase();
  const { collection, getDocs, query, where } = await import('firebase/firestore');
  const q = query(collection(db, 'students'), where('schoolId', '==', schoolId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Student));
}

export async function saveStudent(student: Student, schoolId: string = 'default'): Promise<void> {
  if (!USE_FIREBASE) {
    const all = getStoredStudents();
    const idx = all.findIndex(s => s.id === student.id);
    if (idx >= 0) all[idx] = student;
    else all.push(student);
    saveStoredStudents(all);
    return;
  }
  const { db } = await getFirebase();
  const { doc, setDoc } = await import('firebase/firestore');
  await setDoc(doc(db, 'students', student.id), { ...student, schoolId });
}

export async function deleteStudent(studentId: string): Promise<void> {
  if (!USE_FIREBASE) {
    const all = getStoredStudents().filter(s => s.id !== studentId);
    saveStoredStudents(all);
    return;
  }
  const { db } = await getFirebase();
  const { doc, deleteDoc } = await import('firebase/firestore');
  await deleteDoc(doc(db, 'students', studentId));
}

export async function saveAllStudents(students: Student[], schoolId: string = 'default'): Promise<void> {
  if (!USE_FIREBASE) {
    saveStoredStudents(students);
    return;
  }
  // Batch write for Firestore
  const { db } = await getFirebase();
  const { writeBatch, doc } = await import('firebase/firestore');
  const batch = writeBatch(db);
  students.forEach(s => {
    const ref = doc(db, 'students', s.id);
    batch.set(ref, { ...s, schoolId });
  });
  await batch.commit();
}

// ─── User Operations ──────────────────────────────────────────

export async function fetchUsers(schoolId: string = 'default'): Promise<User[]> {
  if (!USE_FIREBASE) {
    return getStoredUsers();
  }
  const { db } = await getFirebase();
  const { collection, getDocs, query, where } = await import('firebase/firestore');
  const q = query(collection(db, 'users'), where('schoolId', '==', schoolId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data() } as User));
}

export async function saveUser(user: User, schoolId: string = 'default'): Promise<void> {
  if (!USE_FIREBASE) {
    const all = getStoredUsers();
    const idx = all.findIndex(u => u.username === user.username);
    if (idx >= 0) all[idx] = user;
    else all.push(user);
    saveStoredUsers(all);
    return;
  }
  const { db } = await getFirebase();
  const { doc, setDoc } = await import('firebase/firestore');
  await setDoc(doc(db, 'users', `${schoolId}_${user.username}`), { ...user, schoolId });
}

// ─── Auth Operations ──────────────────────────────────────────

export async function firebaseLogin(email: string, password: string) {
  if (!USE_FIREBASE) return null;
  const { auth } = await getFirebase();
  const { signInWithEmailAndPassword } = await import('firebase/auth');
  return signInWithEmailAndPassword(auth, email, password);
}

export async function firebaseLogout() {
  if (!USE_FIREBASE) return;
  const { auth } = await getFirebase();
  const { signOut } = await import('firebase/auth');
  return signOut(auth);
}
