import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: 'AIzaSyBi--Og0SaKCugMrZ6xtH23RRDmJI4P1KM',
	authDomain: 'smart-shopping-list-c7108.firebaseapp.com',
	projectId: 'smart-shopping-list-c7108',
	storageBucket: 'smart-shopping-list-c7108.appspot.com',
	messagingSenderId: '1040087405685',
	appId: '1:1040087405685:web:7136928570d9e64fde943c',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
