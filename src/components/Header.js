import React from "react";
import {Link} from "react-router-dom";

import "../stylesheets/Header.css";

import "../firebase.js";
import firebase from "firebase/app";
import "firebase/auth";
export const provider = new firebase.auth.GoogleAuthProvider();
export const auth = firebase.auth();

class Header extends React.Component {
  constructor(props) {
    super(props);

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }

  logout() {
    auth.signOut().then(() => {
      this.props.logout();
      localStorage.setItem("uid", "");
    });
  }

  login() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(() => {
      provider.setCustomParameters({
        prompt: "select_account"
      });

      auth.signInWithPopup(provider).then(result => {
        const user = result.user;
        this.props.login(user);
      });
    });
  }

  render() {
    return (
      <header id="top-header">
        <Link to="/">
          <img alt="logo" src={process.env.PUBLIC_URL + "/assets/logo.png"} />
          <h1>Binghamton Schedule Manager</h1>
        </Link>
        <div id="top-header-auth-button">
          <p>
            {this.props.user
              ? this.props.user.displayName || this.props.user.email
              : ""}
          </p>
          {this.props.user ? (
            <button className="button gray" onClick={this.logout}>
              Log Out
            </button>
          ) : (
            <button className="button gray" onClick={this.login}>
              Log In
            </button>
          )}
        </div>
      </header>
    );
  }
}

export default Header;
