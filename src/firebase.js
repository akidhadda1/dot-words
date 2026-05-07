import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD9zntrEdpucnHHk5-rtBQz9A4amIlBpss",
  authDomain: "dots-game-9e1a4.firebaseapp.com",
  projectId: "dots-game-9e1a4",
  storageBucket: "dots-game-9e1a4.firebasestorage.app",
  messagingSenderId: "313637711643",
  appId: "1:313637711643:web:c28e00dcb7cc09fab56dbe",
  measurementId: "G-1XPH2658EC",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
