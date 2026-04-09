import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit, onSnapshot, Timestamp, addDoc } from "firebase/firestore";

// Import the Firebase configuration
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Auth Helpers
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);

// Firestore Error Handler
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Data Helpers
export async function saveUserToFirestore(user: User) {
  const userRef = doc(db, "users", user.uid);
  try {
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: Timestamp.now(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
  }
}

export async function saveScoreToFirestore(userId: string, scoreData: any, userData: any) {
  try {
    const scoresRef = collection(db, "scores");
    const docRef = await addDoc(scoresRef, {
      ...scoreData,
      userId,
      userData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "scores");
    return null;
  }
}

export async function getScoreById(scoreId: string) {
  try {
    const scoreRef = doc(db, "scores", scoreId);
    const scoreDoc = await getDoc(scoreRef);
    if (scoreDoc.exists()) {
      return {
        id: scoreDoc.id,
        ...scoreDoc.data(),
        createdAt: scoreDoc.data().createdAt?.toDate()?.toISOString(),
      };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `scores/${scoreId}`);
    return null;
  }
}

export function subscribeToUserScores(userId: string, callback: (scores: any[]) => void) {
  const q = query(
    collection(db, "scores"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(10)
  );

  return onSnapshot(q, (snapshot) => {
    const scores = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()?.toISOString(),
    }));
    callback(scores);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, "scores");
  });
}
