import React from "react";
import queryString from "query-string";

import WeekView from "./WeekView.js";
import Card from "./Card.js"

import "../stylesheets/GroupPage.css";

import "../firebase.js";
import firebase from "firebase/app";
import "firebase/auth";
import UserScheduleContainer from "./UserScheduleContainer";
export const provider = new firebase.auth.GoogleAuthProvider();
export const auth = firebase.auth();

class GroupPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      groupId: "",
      user: null,
      group: {},
      schedules: [],
      role: null,
      exists: true,
      edit_schedule: false
    };
  }

  componentDidMount() {
    auth.onAuthStateChanged(user => {
      if (user) {
        console.log(user);

        const values = queryString.parse(this.props.location.search);
        let groupId = values.groupId;
        if (!groupId) return;
        this.setState({ groupId: groupId });

        firebase
          .firestore()
          .collection("groups")
          .doc(groupId)
          .get()
          .then(group => {
            this.setState({exists: group.exists});
            if (!group.exists) return;
            let roles = group.data().roles;
            if (roles[user.uid] == null) {
              roles[user.uid] = "member";
              firebase
                .firestore()
                .collection("groups")
                .doc(groupId)
                .update({ roles: roles });
            }
            this.setState({ role: roles[this.props.user.uid] });

            if (roles[user.uid] === "member" && !group.data().settings.members_can_view) {
              firebase
                .firestore()
                .collection("groups")
                .doc(groupId)
                .collection("schedules")
                .doc(user.uid)
                .get()
                .then(doc => {
                  this.setState({
                    schedules: {
                      "My Schedule": doc.data().schedule
                    }
                  });
                })
                .catch(err => {
                  console.log("Error getting document --", err);
                });
            } else {
              firebase
                .firestore()
                .collection("groups")
                .doc(groupId)
                .collection("schedules")
                .get()
                .then(snapshot => {
                  let schedules = [];
                  snapshot.forEach(schedule => {
                    firebase
                      .firestore()
                      .collection("usernames")
                      .doc(schedule.id)
                      .get()
                      .then(name => {
                        schedules[schedule.id] = [name.data().username, schedule.data().schedule];
                        this.setState({schedules: schedules});
                      });
                  });
                })
                .catch(err => {
                  console.log("Error getting document --", err);
                });
            }
          })
          .catch(err => {
            console.log("Error getting document --", err);
          });
      } else {
        this.setState({
          groupId: "",
          user: null,
          group: {},
          schedules: [],
          role: null
        });
      }
    });
  }

  render() {
    if (this.state.groupId == null || !this.state.exists) {
      return (
        <div id="group-page-container">
          <h2>Group not found</h2>
        </div>
      );
    }

    if (!this.props.user) {
      return (
        <div id="group-page-container">
          <h2>Please login to view this group</h2>
        </div>
      );
    }

    let courses = [];
    let user_courses = null;
    if (this.state.schedules) {
      Object.keys(this.state.schedules).forEach((uid) => {
        let courses_i = [];
        this.state.schedules[uid][1].forEach(course => {
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
              courses_i.push({
                days: days[i],
                time_start: time_split[0].trim(),
                time_end: time_split[1].trim(),
                name: names[i],
                times: times[i],
                course: content.subject + " " + content.code + "-" + content.section
              });
            }
          }
        }, this);
        if (uid === this.props.user.uid) {
          user_courses = courses_i;
        }
        else {
          courses.push([this.state.schedules[uid][0], courses_i]);
        }
      }, this);
    }

    let schedule_rows = [];
    for (let i = 0; i < courses.length; i += 2) {
      schedule_rows.push(
        <tr key={i}>
          <td>
            <div>
              <WeekView title={courses[i][0]} courses={courses[i][1]} noWeekend />
            </div>
          </td>
          <td>
            {courses[i + 1] ?
              <div>
                <WeekView title={courses[i + 1][0]} courses={courses[i + 1][1]} noWeekend />
              </div>
              :
              null}
          </td>
        </tr>
      );
    }

    return (
      <div id="group-page-container">
        <div id="group-my-schedule-card">
          <Card title="My Schedule"
            editButton={<button style={{float: "right"}} className="button gray"
              onClick={() => {this.setState({edit_schedule: !this.state.edit_schedule})}}>
              {this.state.edit_schedule ? "Cancel" : "Edit schedule"}</button>}>
            {this.props.user && this.state.schedules[this.props.user.uid] ?
              <span>
              <UserScheduleContainer
                noWeekend
                data={this.props.data}
                user={this.props.user}
                schedule={this.state.schedules[this.props.user.uid][1]}
                edit_schedule={this.state.edit_schedule}
                courses={user_courses}
                onSubmit={() => {this.setState({edit_schedule: false})}}
                getField={this.props.getField}
                getTime={(subject, code, section) => {
                  return this.props.getField(subject, code, section, "time").join(", ");
                }} />
                {/* <button style={{position: "absolute", right: 20, bottom: 20}}
              className={"button large " + (this.state.edit_schedule ? "gray" : "green")}
              onClick={() => {this.setState({edit_schedule: !this.state.edit_schedule})}}>
              {this.state.edit_schedule ? "Cancel" : "Edit schedule"}
              </button> */}
              </span>
              :
              null}
          </Card>
        </div>
        <div id="group-schedules">
          {courses.map((courses_i, i) => {
            return <WeekView key={i} title={courses_i[0]} courses={courses_i[1]} noWeekend />
          })}
        </div>
        {/* <table id="group-schedules">
          <tbody>
            {schedule_rows}
          </tbody>
        </table> */}
        {/* courses.map((courses_i, i) => {
              return (
                <div key={i}>
                  <WeekView title={courses_i[0]} courses={courses_i[1]} noWeekend />
                </div>
              );
            }) */}
      </div>
    );
  }
}

export default GroupPage;
