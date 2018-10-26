import React from "react";
import {Link} from "react-router-dom"

import Card from "./Card.js";
import UserScheduleContainer from "./UserScheduleContainer"

import "../firebase.js";
import firebase from "firebase/app";

import "../stylesheets/Landing.css";

class Landing extends React.Component {
  constructor(props) {
    super(props);

    this.state = { title: "", groups: {}, schedule: null, edit_schedule: false };

    this.onChangeTitle = this.onChangeTitle.bind(this);
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        let groups_ref = firebase.firestore().collection("groups");

        let groups_refs = [
          groups_ref.where("roles." + user.uid, "==", "owner"),
          groups_ref.where("roles." + user.uid, "==", "viewer"),
          groups_ref.where("roles." + user.uid, "==", "member")
        ];

        groups_refs.forEach(groups_i_ref => {
          groups_i_ref.get().then(snapshot => {
            snapshot.forEach(doc => {
              let groups_new = this.state.groups;
              groups_new[doc.id] = doc.data();
              this.setState({ groups: groups_new });
            });
          });
        });

        firebase
          .firestore()
          .collection("schedules")
          .doc(user.uid)
          .onSnapshot(doc => {
            if (doc.data()) {
              this.setState({
                schedule: doc.data().schedule
              });
            }
          });
      }
    });
  }

  createGroup(title) {
    if (title && title !== "" && this.props.user) {
      let groups_ref = firebase.firestore().collection("groups");
      groups_ref.doc().set({
        title: title,
        roles: { [this.props.user.uid]: "owner" },
        settings: { members_can_view: true }
      });
    }
  }

  onChangeTitle(e) {
    this.setState({ title: e.target.value });
  }

  render() {
    if (!this.props.user) {
      return (
        <div>
          <p>Please log in to create or view schedule groups</p>
        </div>
      );
    }

    let groups = Object.keys(this.state.groups).map((key, i) => {
      return (
        <li key={i}>
          <Link to={"/group/?groupId=" + key}>
            {this.state.groups[key].title}
          </Link>
        </li>
      );
    });

    let courses = [];
    if (this.state.schedule) {
      this.state.schedule.forEach(course => {
        let i;
        let content = course.content;
        let times = this.props.getField(
          content.subject,
          content.code,
          content.section,
          "time"
        );

        let days = this.props.getField(
          content.subject,
          content.code,
          content.section,
          "days"
        );

        let names = this.props.getField(
          content.subject,
          content.code,
          content.section,
          "course"
        );

        let time_split = [];
        if (times.constructor === Array) {
          for (i = 0; i < times.length; i++) {
            time_split = times[i].split("-");
            courses.push({
              days: days[i],
              time_start: time_split[0].trim(),
              time_end: time_split[1].trim(),
              name: names[i]
            });
          }
        }
      }, this);
    }

    return (
      <div id="landing-container">
        <div id="create-group-card">
          <Card title="Create a Group">
            <label id="name-label">
              <p>Name</p>
              <input
                type="text"
                onChange={this.onChangeTitle}
                placeholder="Enter a group name"
                value={this.state.title}
              />
            </label>
            <br />
            <label id="checkbox-label">
              <p>Members can view all schedules</p>
              <input
                type="checkbox"
                onChange={() => {
                  return 0;
                }}
                value={false}
              />
            </label>
            <button
              id="create-group-button"
              className="button green large"
              onClick={() => {
                this.createGroup(this.state.title);
              }}
            >
              Create Group
            </button>
          </Card>
        </div>
        <div id="my-groups-card">
          <Card title="My Groups">
            <ul>{groups}</ul>
          </Card>
        </div>
        <div id="my-schedules-card">
          <Card title="My Schedule">
            <UserScheduleContainer
              data={this.props.data}
              user={this.props.user}
              schedule={this.state.schedule}
              edit_schedule={this.state.edit_schedule}
              courses={courses}
              getField={this.props.getField}
              onSubmit={() => {this.setState({edit_schedule: false})}} />
            <button style={{position: "absolute", right: 20, bottom: 20}}
              className={"button large " + (this.state.edit_schedule ? "gray" : "green")}
              onClick={() => {this.setState({edit_schedule: !this.state.edit_schedule})}}>
              {this.state.edit_schedule ? "Cancel" : "Edit schedule"}
            </button>
          </Card>
        </div>
      </div>
    );
  }
}

export default Landing;
