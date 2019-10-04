import React from "react";
import { Switch, Route } from "react-router-dom";
import GroupPage from "./GroupPage.js";
import Landing from "./Landing.js";

import "../firebase.js";
import firebase from "firebase/app";
import "firebase/auth";
export const provider = new firebase.auth.GoogleAuthProvider();
export const auth = firebase.auth();

class Main extends React.Component {
  constructor(props) {
    super(props);

    this.state = {data: null};

    auth.onAuthStateChanged(async user => {
      if (user) {
        firebase
          .firestore()
          .collection("usernames")
          .doc(user.uid)
          .get()
          .then(doc => {
            if (doc.data() == null) {
              firebase
                .firestore()
                .collection("usernames")
                .doc(user.uid)
                .set({ username: user.displayName });
            }
          });
      }
    });

    this.getField = this.getField.bind(this);
  }

  componentDidMount() {
    const ref = this;
    import("../data/data.json").then(data => {
      ref.setState({ data: data["default"] || data });
    });
  }

  getField(subject, code, section, field) {
    const get = (p, o) => p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o)
    let course = get([subject, code, section], this.state.data)
    console.log(subject, code, section, course)

    // if (this.state.data && subject && code && section) {
      // let course = this.state.data[subject][code][section];
      if (course) {
        if (course[field].constructor === Array) {
          return course[field];
        } else {
          let out = [];
          out.push(course[field]);
          return out;
        }
      }

      return "";
    // }
    // return "";
  }

  render() {
    return (
      <Switch>
        <Route
          exact path="/"
          render={props =>
            <Landing {...props}
              user={this.props.user}
              data={this.state.data} getField={this.getField}
            />}
        />
        <Route
          path="/group"
          render={props =>
            <GroupPage {...props}
              user={this.props.user}
              data={this.state.data} getField={this.getField} />}
        />
      </Switch>
    );
  }
}

export default Main;
