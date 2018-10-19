import React from "react";

import Card from './Card.js'

import '../firebase.js'
import firebase from 'firebase/app'

import '../stylesheets/Landing.css'

class Landing extends React.Component {
  constructor(props) {
    super(props);

    this.state = {title: "", groups: {}};

    this.onChangeTitle = this.onChangeTitle.bind(this);
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        var groups_ref = firebase.firestore().collection("groups");

        var groups_refs = [
          groups_ref.where("roles." + user.uid, '==', 'owner'),
          groups_ref.where("roles." + user.uid, '==', 'viewer'),
          groups_ref.where("roles." + user.uid, '==', 'member'),
        ];

        groups_refs.forEach((groups_ref) => {
          groups_ref.get().then((snapshot) => {
            snapshot.forEach((doc) => {
              var groups_new = this.state.groups;
              groups_new[doc.id] = doc.data()
              this.setState({groups: groups_new});
            });
          });
        });
      }
    });
  }

  createGroup(title) {
    if (title && title !== "" && this.props.user) {
      var groups_ref = firebase.firestore().collection("groups");
      groups_ref.doc().set({title: title,
        roles: {[this.props.user.uid]: "owner"},
        settings: {members_can_view: true}});
    }
  }

  onChangeTitle(e) {
    this.setState({title: e.target.value});
  }

  render() {
    if (!this.props.user) {
      return (
        <div>
          <p>Please log in to create or view schedule groups</p>
        </div>
      );
    }

    var groups = Object.keys(this.state.groups).map((key, i) => {
      return <li key={i}><a href={process.env.PUBLIC_URL + "/group/?groupId=" + key}>
            {this.state.groups[key].title}</a></li>;
    });

    return (
      <div id="landing-container">
        <div id="create-group-card">
          <Card title="Create a group">
            <label id="name-label">
              <p>Name</p>
              <input type="text" onChange={this.onChangeTitle}
                placeholder="Enter a group name" value={this.state.title} />
            </label>
            <br />
            <label id="checkbox-label">
              <p>Members can view all schedules</p>
              <input type="checkbox" onChange={() => {return 0}}
                value={false} />
            </label>
            <button id="create-group-button" className="button green large"
              onClick={() => {this.createGroup(this.state.title)}}>Create Group</button>
          </Card>
        </div>
        <div id="my-groups-card">
          <Card title="My groups">
            <ul>{groups}</ul>
          </Card>
        </div>
        <div id="my-schedules-card">
          <Card title="My schedules">
          </Card>
        </div>
      </div>
    );
  }
}

export default Landing;
