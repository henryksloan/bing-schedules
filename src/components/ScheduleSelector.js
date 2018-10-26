import React from "react";

import "../firebase.js";
import firebase from "firebase/app";
export const provider = new firebase.auth.GoogleAuthProvider();
export const auth = firebase.auth();

class ScheduleSelector extends React.Component {
  constructor(props) {
    super(props);

    this.state = {schedule: null};

    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {
    this._ismounted = true;
  }

  componentWillUnmount() {
    this._ismounted = false;
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.user) return;
    firebase
      .firestore()
      .collection("schedules")
      .doc(nextProps.user.uid)
      .onSnapshot(doc => {
        if (doc.data() && this._ismounted) {
          this.setState({
            schedule: doc.data().schedule
          });
        }
      });
  }

  onClick() {
    firebase
      .firestore()
      .collection("groups")
      .doc(this.props.group_id)
      .collection("schedules")
      .doc(this.props.user.uid)
      .set({ schedule: this.state.schedule });
  }

  render() {
    return (
      <div>
        <button onClick={this.onClick}>Add my schedule</button>
      </div>
    );
  }
}

export default ScheduleSelector;