import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAC9n3-ZJjQ8thK4ypNHlZYqo0VBJ0L9Tk",
  authDomain: "franchise-fp.firebaseapp.com",
  databaseURL: "https://franchise-fp-default-rtdb.firebaseio.com",
  projectId: "franchise-fp",
  storageBucket: "franchise-fp.firebasestorage.app",
  messagingSenderId: "118573363628",
  appId: "1:118573363628:web:ae29b4ae91d8aa4fbb0a09"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);