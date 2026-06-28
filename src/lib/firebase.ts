import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "bubbly-ward-l18qq",
  appId: "1:307588942286:web:a2a2c724de8deed284039f",
  apiKey: "AIzaSyBy_O7HUKve_gidBKrMIeo3uWS0tHaotAo",
  authDomain: "bubbly-ward-l18qq.firebaseapp.com",
  storageBucket: "bubbly-ward-l18qq.firebasestorage.app",
  messagingSenderId: "307588942286",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with custom databaseId
const dbId = "ai-studio-locktfin-098d97b0-0217-40e5-b8b5-bdc1a8394f41";
export const db = getFirestore(app, dbId);

// Test Connection
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase Connection verified successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration: client is offline.");
    } else {
      console.log("Firebase initialization status checked (no test record, which is normal).");
    }
  }
}

// Re-export Auth methods
export { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
};
