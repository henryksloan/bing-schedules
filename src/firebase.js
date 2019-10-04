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

firebase.firestore().enablePersistence()
  .catch(function(err) {
      if (err.code === 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled
          // in one tab at a a time.
          console.log(err.code);
      } else if (err.code === 'unimplemented') {
          // The current browser does not support all of the
          // features required to enable persistence
          console.log(err.code);
      }
  });
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);

export default firebase;
