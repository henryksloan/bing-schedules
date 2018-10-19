import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
var config = {

  apiKey: "AIzaSyAtkDMcmqJXjxNRvx84gYKQqssbarfkaOs",
  authDomain: "bing-schedules.firebaseapp.com",
  databaseURL: "https://bing-schedules.firebaseio.com",
  projectId: "bing-schedules",
  storageBucket: "bing-schedules.appspot.com",
  messagingSenderId: "249912717870"
};
firebase.initializeApp(config);

const firestore = firebase.firestore();
const settings = {timestampsInSnapshots: true};
firestore.settings(settings);

export default firebase;
