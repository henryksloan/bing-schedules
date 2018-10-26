import React from "react";
import queryString from "query-string";

import ScheduleSelector from "./ScheduleSelector.js";
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
      role: null
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
                name: names[i]
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

    if (this.state.groupId == null) {
      return (
        <div id="group-page-container">
          <h2>Group not found</h2>
        </div>
      );
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
          <Card title="My Schedule">
            <ScheduleSelector user={this.props.user} group_id={this.state.groupId} />
            {this.props.user ?
              <UserScheduleContainer
                noWeekend
                data={this.props.data}
                user={this.props.user}
                schedule={this.state.schedules[this.props.user.uid]}
                edit_schedule={false}
                courses={user_courses}
                getField={this.props.getField}
                getTime={(subject, code, section) => {
                  return this.props.getField(subject, code, section, "time").join(", ");
                }} />
              :
              null}
          </Card>
        </div>
        <table id="group-schedules">
          <tbody>
            {schedule_rows}
          </tbody>
        </table>
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
