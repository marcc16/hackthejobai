/* eslint-disable @typescript-eslint/no-unused-vars */
import { getApp, getApps, initializeApp} from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage} from 'firebase/storage';




const firebaseConfig = {
    apiKey: "AIzaSyDBM9Oi03TbOG-VxOgJKzXEIoOOs0g67VE",
    authDomain: "hackthejobai.firebaseapp.com",
    projectId: "hackthejobai",
    storageBucket: "hackthejobai.appspot.com",
    messagingSenderId: "131382126992",
    appId: "1:131382126992:web:62d71f628188fc0798ab15",
    measurementId: "G-HTK6C1BT4N"
  };

const app = getApps().length === 0 ?  initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };