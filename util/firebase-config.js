// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"

const firebaseConfig = {
  apiKey: "AIzaSyAAnmO7nI6gJzwBWI3tTo3K4Eg74tPjh-g",
  authDomain: "swiftkart-7fb51.firebaseapp.com",
  projectId: "swiftkart-7fb51",
  storageBucket: "swiftkart-7fb51.firebasestorage.app",
  messagingSenderId: "456758294391",
  appId: "1:456758294391:web:0056baf3bd3311f0909372",
  measurementId: "G-NLYF3M8XR6"
};

const firebaseAppConfig = initializeApp(firebaseConfig);
export default firebaseAppConfig