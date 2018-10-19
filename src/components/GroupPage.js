import React from "react";
import queryString from 'query-string'

import CourseContainer from './CourseContainer.js'
import WeekView from './WeekView.js'

import '../firebase.js'
import firebase from 'firebase/app'
import 'firebase/auth'
export const provider = new firebase.auth.GoogleAuthProvider();
export const auth = firebase.auth();

class GroupPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {groupId: "", user: null, group: {}, data: null, schedules: [], role: null};
    this.getField = this.getField.bind(this);
  }

  componentDidMount() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log(user);

        const values = queryString.parse(this.props.location.search)
        var groupId = values.groupId;
        this.setState({groupId: groupId});

        firebase.firestore().collection("groups").doc(groupId).get().then((group) => {
          var roles = group.data().roles;
          if (roles[this.props.user.uid] == null) {
            roles[this.props.user.uid] = "member";
            firebase.firestore().collection("groups").doc(groupId).update({roles: roles});
          }
          this.setState({role: roles[this.props.user.uid]});

          if (roles[this.props.user.uid] === "member" && !group.data().settings.members_can_view) {
            firebase.firestore().collection("groups")
              .doc(groupId).collection("schedules").doc(user.uid).get().then(doc => {
                  this.setState({schedules: {"My Schedule": doc.data().schedule}});
              }).catch((err) => {
                console.log("Error getting document --", err);
              });
          }
          else {
            firebase.firestore().collection("groups")
              .doc(groupId).collection("schedules").get().then(snapshot => {
                var schedules = [];
                snapshot.forEach(doc => {
                  firebase.firestore().collection("usernames").doc(doc.id).get().then((name) => {
                    schedules[name.data().username] = doc.data().schedule;
                    this.setState({schedules: schedules});
                  });
                });
              }).catch((err) => {
                console.log("Error getting document --", err);
              });
          }
        }).catch((err) => {
          console.log("Error getting document --", err);
        });
      }
      else {
        this.setState({groupId: "", user: null, group: {}, schedules: [], role: null});
      }
    });

    var ref = this;
    import('../data/data.json').then(data => {
      // data.splice(data.indexOf("default"), 1);
      ref.setState({data: data["default"]});
    });
  }

  getField(subject, code, section, field) {
    if (subject && code && section) {
      var course = this.state.data[subject][code][section];
      if (course) {
        if (course[field].constructor === Array) {
          return course[field];
        }
        else {
          var out = [];
          out.push(course[field]);
          return out;
        }
      }

      return '';
    }
    return '';
  }

  render() {
    var courses = [];
    if (this.state.schedules) {
      Object.keys(this.state.schedules).forEach((key, index) => {
        var courses_i = [];
        this.state.schedules[key].forEach((course) => {
          var content = course.content;
          var times = this.getField(content.subject, content.code, content.section, "time");
          var days = this.getField(content.subject, content.code, content.section, "days");
          var names = this.getField(content.subject, content.code, content.section, "course");
          var time_split = [];
          if (times.constructor === Array) {
            for (var i = 0; i < times.length; i++) {
              time_split = times[i].split("-");
              courses_i.push({days: days[i],
                              time_start: time_split[0].trim(), time_end: time_split[1].trim(),
                              name: names[i]});
            }
          }
          else {
              time_split = times.split("-");
              courses_i.push({days: days[i],
                              time_start: time_split[0].trim(), time_end: time_split[1].trim(),
                              name: names[i]});
          }
        }, this);
        courses.push([key, courses_i]);
      }, this);
    }

    return (
      <div>
        {this.state.role}
        <CourseContainer 
          data={this.state.data} user={this.props.user} groupId={this.state.groupId}
          getTime={(subject, code, section) => {
            return this.getField(subject, code, section, "time").join(", ");
          }} />
        {courses.map((courses_i, i) => {
          return (
            <div key={i}>
              <WeekView title={courses_i[0]} courses={courses_i[1]} />
            </div>
          );
        })}
      </div>
    );
  }
}

export default GroupPage;
