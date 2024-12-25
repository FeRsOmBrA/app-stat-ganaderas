// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from 'firebase/database';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDO8RKm4oZ_XsCUv8r74vpeCERMRriBQjI",
    authDomain: "app-estadisticas-ganaderas.firebaseapp.com",
    databaseURL: "https://app-estadisticas-ganaderas-default-rtdb.firebaseio.com",
    projectId: "app-estadisticas-ganaderas",
    storageBucket: "app-estadisticas-ganaderas.firebasestorage.app",
    messagingSenderId: "501466076729",
    appId: "1:501466076729:web:e11a86fa294f5cef37dfe8",
    measurementId: "G-26WKLBRJT7"
};


const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

