
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  "projectId": "campusflow-115rx",
  "appId": "1:801401426927:web:ac6d66331ecf87aef61c1a",
  "storageBucket": "campusflow-115rx.firebasestorage.app",
  "apiKey": "AIzaSyAbT8BGnyxoP2IXaCsf_UB_GEMIsFx2PXU",
  "authDomain": "campusflow-115rx.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "801401426927"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
