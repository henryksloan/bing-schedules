import React from 'react'
import { Switch, Route } from 'react-router-dom'
import GroupPage from './GroupPage.js'
import Landing from './Landing.js'

import '../firebase.js'
import firebase from 'firebase/app'
import 'firebase/auth'
export const provider = new firebase.auth.GoogleAuthProvider();
export const auth = firebase.auth();

class Main extends React.Component {
  constructor(props) {
    super(props);

    auth.onAuthStateChanged((user) => {
      if (user) {
        firebase.firestore().collection("usernames").doc(user.uid).get().then((doc) => {
          if (doc.data() == null) {
            firebase.firestore().collection("usernames").doc(user.uid).set({username: user.displayName});
          }
        });
      }
    });
  }
  render() {
    return (
      <Switch>
        <Route exact path='/'
          render={(props) => <Landing {...props} user={this.props.user} />} />
        <Route path='/group'
          render={(props) => <GroupPage {...props} user={this.props.user} />} />
      </Switch>
    )
  }
}

export default Main;
