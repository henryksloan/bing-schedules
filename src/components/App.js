import React from "react";

import Header from "./Header.js";
import Main from "./Main.js";

import "../firebase.js";
import firebase from "firebase/app";
import "firebase/auth";
export const provider = new firebase.auth.GoogleAuthProvider();
export const auth = firebase.auth();

class App extends React.Component {
  constructor() {
    super();

    this.state = { user: null };
  }

  componentDidMount() {
    auth.onAuthStateChanged(user => {
      user ? this.setState({ user: user }) : this.setState({ user: null });
    });
  }

  render() {
    return (
      <div id="app">
        <Header
          user={this.state.user}
          login={user => {
            this.setState({ user: user });
          }}
          logout={() => {
            this.setState({ user: null });
          }}
        />
        <Main user={this.state.user} />
      </div>
    );
  }
}

export default App;
