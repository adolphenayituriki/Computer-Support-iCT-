import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDYPQVopQH9i3K1UsiJ7SOrTj52WPDcd7k",
  authDomain: "cs-hub-ict.firebaseapp.com",
  projectId: "cs-hub-ict",
  storageBucket: "cs-hub-ict.firebasestorage.app",
  messagingSenderId: "742963952046",
  appId: "1:742963952046:web:fb83e36169d92bd68ff03f",
  measurementId: "G-5RNTX874BS"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, RecaptchaVerifier, signInWithPhoneNumber };
