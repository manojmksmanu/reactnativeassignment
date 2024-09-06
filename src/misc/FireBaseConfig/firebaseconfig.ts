import firebase from '@react-native-firebase/app';
// import storage from '@react-native-firebase/storage';
import getStorage from '@react-native-firebase/storage';

// Firebase configuration object
const firebaseConfig = {
  apiKey: 'AIzaSyAybI_dJ1ZTy6XmJodG8qZ_9fQ-cWAVjnM',
  authDomain: 'reactnative-a9cd0.firebaseapp.com',
  projectId: 'reactnative-a9cd0',
  storageBucket: 'reactnative-a9cd0.appspot.com',
  messagingSenderId: '1077116040460',
  appId: '1:1077116040460:web:cc36eccf776193c0848529',
  measurementId: 'G-4C5V3PD6Q4',
  databaseURL: 'https://reactnative-a9cd0.firebaseio.com',
};

// Initialize Firebase app if it hasn't been initialized already
const configFirebase = async () => {
  try {
    if (!firebase.apps.length) {
      console.log('Attempting to initialize Firebase');
      await firebase.initializeApp(firebaseConfig);
      console.log('Firebase Initialized Successfully');
    } else {
      console.log('Using Existing Firebase App');
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
};
configFirebase();

export {firebase, getStorage};
