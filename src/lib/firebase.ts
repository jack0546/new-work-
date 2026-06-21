import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC8BoL8yfKIQ2o-tVmbrVfx0TXcUvudzyY",
  authDomain: "project-3cccff25-b1fb-4aa9-978.firebaseapp.com",
  projectId: "project-3cccff25-b1fb-4aa9-978",
  storageBucket: "project-3cccff25-b1fb-4aa9-978.firebasestorage.app",
  messagingSenderId: "1009826575246",
  appId: "1:1009826575246:web:595912191007526e5deadf"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export async function loginUser(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function registerUser(email: string, password: string, name: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "users", userCredential.user.uid), {
    name,
    email,
    createdAt: serverTimestamp()
  });
  return userCredential;
}

export async function logoutUser() {
  return signOut(auth);
}

export function onAuthStateChange(callback: (user: any) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function createOrder(order: any) {
  return addDoc(collection(db, "orders"), {
    ...order,
    createdAt: serverTimestamp()
  });
}

export async function getUserOrders(userId: string) {
  const q = query(collection(db, "orders"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}