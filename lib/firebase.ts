import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getStorage, ref } from "firebase/storage"
import { getFirestore } from "firebase/firestore"

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJxEkRwyOsxjQbQEUdIJDa-Em3MNLkcR4",
  authDomain: "qr-photobooth-c48c1.firebaseapp.com",
  projectId: "qr-photobooth-c48c1",
  storageBucket: "qr-photobooth-c48c1.firebasestorage.app",
  messagingSenderId: "925393786405",
  appId: "1:925393786405:web:6a9837bbc2e976941d51cc",
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const auth = getAuth(app)
const storage = getStorage(app)
const db = getFirestore(app)

// Configure storage with default settings
if (typeof window !== "undefined") {
  // Only run this in browser environments
  const storageRef = ref(storage)
  // This will apply CORS settings from Firebase console
}

export { app, auth, storage, db }
