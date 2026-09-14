// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, PhoneAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDDkwWMRdgYUESYgDDdVcvlfnFwBuHc6RA",
  authDomain: "fir-fb194.firebaseapp.com",
  projectId: "fir-fb194",
  storageBucket: "fir-fb194.firebasestorage.app",
  messagingSenderId: "899492918234",
  appId: "1:899492918234:web:c6bf06450535c16b9d86e3",
  measurementId: "G-63NTQ4KJJF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

console.log("Firebase Project:", firebaseConfig.projectId);
console.log("Firebase App:", app.options);

const analytics = getAnalytics(app);

const auth = getAuth(app);
const phoneProvider = new PhoneAuthProvider(auth);
const db = getFirestore(app);

export { auth, phoneProvider, db };