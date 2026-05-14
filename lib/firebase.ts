import { initializeApp } from "firebase/app";

import {
  getAuth,
} from "firebase/auth";

import {
  getFirestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD4lpsO25utOhV7dQkACj6Q4_u0SsWtfaA",
  authDomain: "grocery-live-app.firebaseapp.com",
  projectId: "grocery-live-app",
  storageBucket: "grocery-live-app.firebasestorage.app",
  messagingSenderId: "65525796659",
  appId: "1:65525796659:web:37d3353625b58b4c75f846",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);