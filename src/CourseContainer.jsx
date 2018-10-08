import React from "react";
import ReactDOM from "react-dom";

import CourseSelector from "./CourseSelector.jsx"

class CourseContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: null,
      subject_options: [],
      entries: [{subject: null, code: null, section: null},
                {subject: null, code: null, section: null}]
    };

    this.getCodes = this.getCodes.bind(this);
    this.getSections = this.getSections.bind(this);
    this.getTime = this.getTime.bind(this);
    this.updateEntry = this.updateEntry.bind(this);
    this.addEntry = this.addEntry.bind(this);
    this.removeEntry = this.removeEntry.bind(this);
  }

  componentDidMount() {
    var ref = this;
    require.ensure(['../data/data.json'], (require) => {
      const data = require('../data/data.json');
      const opt = Object.keys(data).reduce((obj, x) => {
        obj.push({value: x, label: x});
        return obj;
      }, []);
      ref.setState({data: data, subject_options: opt});
    });
  }

  getCodes(subject) {
    if (subject && subject.value) {
      return Object.keys(this.state.data[subject['value']]).reduce((obj, x) => {
        obj.push({value: x, label: x});
        return obj;
      }, []);
    }

    return [];
  }

  getSections(subject, code) {
    if (subject && code && subject.value && code.value) {
      return Object.keys(this.state.data[subject['value']][code['value']]).reduce((obj, x) => {
        obj.push({value: x, label: x});
        return obj;
      }, []);
    }

    return [];
  }

  updateEntry(index, changed_info, callback) {
      var entries = this.state.entries;
      if (entries[index] == null || changed_info == null) return;
      entries[index] = Object.assign(entries[index], changed_info);
      this.setState({entries: entries}, callback);
  }

  getTime(subject, code, section) {
    if (subject && code && section && subject.value && code.value && section.value) {
      var course = this.state.data[subject['value']][code['value']][section['value']];
      return (course) ? course['time'].join(", ") : '';
    }
    return '';
  }

  addEntry() {
      var entries = this.state.entries;
      entries.push({subject: null, code: null, section: null});
      this.setState({entries: entries});
  }

  removeEntry(index) {
      var entries = this.state.entries;
      entries.splice(index, 1);
      this.setState({entries: entries});
  }

  render() {
    var selectors = this.state.entries.map((entry, index) => {
      return (
        <CourseSelector
          key={index} index={index}
          subject={entry.subject} code={entry.code} section={entry.section}
          subject_options={this.state.subject_options}
          getCodes={this.getCodes}
          getSections={this.getSections}
          updateEntry={this.updateEntry}
          removeEntry={this.removeEntry}
          getTime={this.getTime} />
      );
    });

    return (
      <div className="course-container">
        {selectors}
        <div id="course-container-buttons">
          <button onClick={this.addEntry}>Add another course</button>
          <button onClick={this.addEntry}>Get times</button>
        </div>
        {this.state.entries.map((entry) => {return this.getTime(entry.subject, entry.code, entry.section)}).filter((el) => {return el != ''}).join(", ")}
      </div>
    )
  }
}

export default CourseContainer;
