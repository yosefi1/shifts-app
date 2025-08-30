import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDfAt-Cinm5h4ACwrVIoknhYjYdkhd_koA",
  authDomain: "shifts-app-6a7f1.firebaseapp.com",
  projectId: "shifts-app-6a7f1",
  storageBucket: "shifts-app-6a7f1.firebasestorage.app",
  messagingSenderId: "716111163550",
  appId: "1:716111163550:web:db607935fe8ab934868b8f",
  measurementId: "G-CD7FN36S84"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore and Auth
export const db = getFirestore(app)
export const auth = getAuth(app)

export default app
