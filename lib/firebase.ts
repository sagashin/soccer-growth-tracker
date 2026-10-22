import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'soccer-pickup-calc',
  appId: '1:1042420843271:web:17e08946792bad06ba7ba2',
  storageBucket: 'soccer-pickup-calc.firebasestorage.app',
  apiKey: 'AIzaSyBSXCduEYpZJ_YbQAnGqb_yNX0SLQL0W8k',
  authDomain: 'soccer-pickup-calc.firebaseapp.com',
  messagingSenderId: '1042420843271',
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

