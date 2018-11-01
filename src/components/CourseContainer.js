import React from "react";

import CourseSelector from "./CourseSelector.js";

import "../stylesheets/CourseContainer.css";

import "../firebase.js";
import firebase from "firebase/app";
export const provider = new firebase.auth.GoogleAuthProvider();
export const auth = firebase.auth();

class CourseContainer extends React.Component {
  constructor(props) {
    super(props);

    const opt = (props.data)
      ? Object.keys(props.data).reduce((obj, x) => {
        obj.push({ value: x, label: x });
        return obj;
      }, [])
      : [];

    let initial_entries = [
      { subject: null, code: null, section: null },
      { subject: null, code: null, section: null }
    ];

    if (props.initial) {
      console.log(props.initial);
      initial_entries = props.initial.reduce((obj, x) => {
        obj.push({subject: {value: x.content.subject, label: x.content.subject},
                  code: {value: x.content.code, label: x.content.code},
                  section: {value: x.content.section, label: x.content.section}});
        return obj;
      }, []);
    }

    this.state = {
      subject_options: opt,
      entries: initial_entries,
      selector_refs: [],
      loading: false
    };

    this.getCodes = this.getCodes.bind(this);
    this.getSections = this.getSections.bind(this);
    this.updateEntry = this.updateEntry.bind(this);
    this.getActivities = this.getActivities.bind(this);
    this.addEntry = this.addEntry.bind(this);
    this.addFilledEntry = this.addFilledEntry.bind(this);
    this.removeEntry = this.removeEntry.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.focusNextEntry = this.focusNextEntry.bind(this);
    this.shouldFindActivities = this.shouldFindActivities.bind(this);
    this.renderActivityButtons = this.renderActivityButtons.bind(this);
  }

  getCodes(subject) {
    if (subject && subject.value) {
      return Object.keys(this.props.data[subject.value]).reduce((obj, x) => {
        obj.push({ value: x, label: x });
        return obj;
      }, []);
    }

    return [];
  }

  getSections(subject, code) {
    if (subject && code && subject.value && code.value) {
      let raw = Object.keys(this.props.data[subject.value][code.value]).reduce(
        (obj, x) => {
          let already_entered = false;
          for (let entry in this.state.entries) {
            if (
              this.state.entries[entry].subject &&
              this.state.entries[entry].code &&
              this.state.entries[entry].section &&
              this.state.entries[entry].subject.value === subject.value &&
              this.state.entries[entry].code.value === code.value &&
              this.state.entries[entry].section.value === x
            ) {
              already_entered = true;
              break;
            }
          }

          let type = this.props.data[subject.value][code.value][x].type[0];
          if (!obj[type]) obj[type] = [];
          obj[type].push({
            value: x,
            label: x,
            time: this.props.getTime(subject.value, code.value, x),
            already_entered: already_entered
          });
          return obj;
        },
        {}
      );

      return Object.entries(raw).reduce((obj, x) => {
        obj.push({ label: x[0], options: x[1] });
        return obj;
      }, []);
    }

    return [];
  }

  updateEntry(index, changed_info, callback) {
    let entries = this.state.entries;
    if (entries[index] === null || changed_info === null) return;
    entries[index] = Object.assign(entries[index], changed_info);
    this.setState({ entries: entries }, callback);
  }

  getActivities(subject, code, section) {
    if (
      subject &&
      code &&
      section &&
      subject.value &&
      code.value &&
      section.value
    ) {
      return Object.keys(this.props.data[subject.value][code.value]).filter(
        section_key => {
          let section = this.props.data[subject.value][code.value][section_key];
          return (
            section.type[0] === "Activity" || section.type[0] === "Discussion"
          );
        }
      );
    }

    return [];
  }

  addEntry() {
    let entries = this.state.entries;
    entries.push({ subject: null, code: null, section: null });
    this.setState({ entries: entries });
  }

  addFilledEntry(subject, code, section, index) {
    let entries = this.state.entries;
    entries.splice(index, 0, {
      subject: subject,
      code: code,
      section: section
    });
    this.setState({ entries: entries });
  }

  removeEntry(index) {
    let entries = this.state.entries;
    entries.splice(index, 1);
    this.setState({ entries: entries }, () => {
      if (this.state.entries.length === 0) this.addEntry();
    });
  }

  componentDidMount() {
    this._ismounted = true;
  }

  componentWillUnmount() {
    this._ismounted = false;
  }

  onSubmit() {
    let entries_to_submit = [];
    for (let i = 0; i < this.state.entries.length; i++) {
      if (
        this.state.entries[i].subject == null &&
        this.state.entries[i].code == null &&
        this.state.entries[i].section == null
      ) {
        // TODO: In this case, just skip it
        console.log("All null");
        continue;
      }

      if (
        this.state.entries[i].subject == null ||
        this.state.entries[i].code == null ||
        this.state.entries[i].section == null
      ) {
        // TODO: Improve and actually display this message
        console.log("Please enter all fields or remove the row to continue");
        continue;
      }

      entries_to_submit.push(this.state.entries[i]);
    }

    if (entries_to_submit.length === 0) {
      // TODO: Just disable submit in this case
      console.log("Please enter a course");
      return;
    }

    var schedule_list = entries_to_submit.map(entry => {
      return {
        type: "course",
        content: {
          subject: entry.subject.value,
          code: entry.code.value,
          section: entry.section.value
        }
      };
    });

    this.setState({loading: true});
    firebase
      .firestore()
      .collection("schedules")
      .doc(this.props.user.uid)
      .set({ schedule: schedule_list })
      .then(() => {
        this.props.onSubmit();
        if (this._ismounted) {
          this.setState({loading: false});
        }
      })
      .catch(err => {
        console.log("Error getting document --", err);
        this.setState({loading: false});
      });


    let groups_ref = firebase.firestore().collection("groups");

    let groups_refs = [
      groups_ref.where("roles." + this.props.user.uid, "==", "owner"),
      groups_ref.where("roles." + this.props.user.uid, "==", "viewer"),
      groups_ref.where("roles." + this.props.user.uid, "==", "member")
    ];

    groups_refs.forEach(groups_i_ref => {
      groups_i_ref.get().then(snapshot => {
        snapshot.forEach(doc => {
          doc.ref.collection("schedules").doc(this.props.user.uid).get().then((schedule) => {
            if (schedule.exists) {
              doc.ref.collection("schedules").doc(this.props.user.uid).set({schedule: schedule_list});
            }
          });
        }, this);
      });
    }, this);
  }

  focusNextEntry(index) {
    if (this.selector_refs.length <= index + 1) {
      this.addEntry();
      this.to_focus = index + 1;
    } else {
      this.selector_refs[index + 1].focusSubject();
    }
  }

  shouldFindActivities(index) {
    for (let i = 0; i < this.state.entries.length; i++) {
      if (
        !this.state.entries[i].subject ||
        !this.state.entries[i].code ||
        !this.state.entries[index].subject ||
        !this.state.entries[index].code
      )
        continue;

      let entry = this.state.entries[index];
      if (entry.subject && entry.code && entry.section) {
        let datapoint = this.props.data[entry.subject.value][entry.code.value][
          entry.section.value
          ];
        if (
          datapoint.type[0] === "Discussion" ||
          datapoint.type[0] === "Activity"
        ) {
          return false;
        }
      }

      if (i === index) continue;

      if (
        this.state.entries[i].subject.value === entry.subject.value &&
        this.state.entries[i].code.value === entry.code.value
      ) {
        return false;
      }
    }

    return true;
  }

  renderActivityButtons(index) {
    if (!this.shouldFindActivities(index)) return;
    let entry = this.state.entries[index];
    if (!entry) return;

    let activities = this.getActivities(
      entry.subject,
      entry.code,
      entry.section
    ).reduce((obj, activity, i) => {
      obj.push(
        <button
          key={i}
          className="button gray"
          onClick={() => {
            this.addFilledEntry(
              entry.subject,
              entry.code,
              {value: activity, label: activity},
              index + 1
            );
            this.to_focus = index + 2;
          }}>
          {activity}
          {" | "}
          {this.props.getTime(entry.subject.value, entry.code.value, activity)}
        </button>
      );
      return obj;
    }, []);

    if (activities.length > 0) {
      return <div>Add activities: {activities}</div>;
    }
  }

  render() {
    this.selector_refs = [];
    let selectors = this.state.entries.map((entry, index) => {
      return (
        <div key={index}>
          <CourseSelector
            index={index}
            subject={entry.subject}
            code={entry.code}
            section={entry.section}
            subject_options={this.state.subject_options}
            getCodes={this.getCodes}
            getSections={this.getSections}
            updateEntry={this.updateEntry}
            removeEntry={this.removeEntry}
            focusNextEntry={() => {
              this.focusNextEntry(index);
            }}
            ref={el => {
              this.selector_refs[index] = el;
              if (this.to_focus === index) {
                el.focusSubject();
                this.to_focus = null;
              }
            }}
          />
          {this.renderActivityButtons(index)}
        </div>
      );
    });

    return (
      <div className="course-container">
        {selectors}
        <div id="course-container-buttons">
          <button className="button gray large" onClick={this.addEntry}>
            Add another course
          </button>
          <button className="button gray large" onClick={this.onSubmit}>
            Submit
          </button>
          <img src={process.env.PUBLIC_URL + "/assets/loading.gif"}
            style={{display: this.state.loading ? "inline" : "none"}}
            alt="Loading..." />
        </div>
      </div>
    );
  }
}

export default CourseContainer;
