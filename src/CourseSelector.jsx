import React from "react";
import ReactDOM from "react-dom";

import Select from 'react-select';

class CourseSelector extends React.Component {
  constructor(props) {
    super(props);

    this.changeSubject = this.changeSubject.bind(this);
    this.changeCode = this.changeCode.bind(this);
    this.changeSection = this.changeSection.bind(this);
  }

  changeSubject(selected) {
    this.props.updateEntry(this.props.index,
        {subject: selected, code: null, section: null},
        (() => this.code_select.focus()));
  }

  changeCode(selected) {
    this.props.updateEntry(this.props.index,
        {code: selected, section: null},
        (() => this.section_select.focus()));
  }

  changeSection(selected) {
    this.props.updateEntry(this.props.index, {section: selected});
  }

  render() {
    const { subject, code, section } = this.props;

    var code_options = this.props.getCodes(subject);
    var section_options = this.props.getSections(subject, code);

    return (
      <div>
        <Select
          tabIndex={0}
          value={subject}
          onChange={this.changeSubject}
          options={this.props.subject_options}
          placeholder="Select Subject"
          openMenuOnFocus={true}
          tabSelectsValue={false}
          className="course-select"
          ref={(el) => { this.subject_select = el }} />
        <Select
          tabIndex={0}
          value={code}
          onChange={this.changeCode}
          options={code_options}
          placeholder="Select Course"
          openMenuOnFocus={true}
          tabSelectsValue={false}
          isDisabled={code_options.length == 0}
          className="course-select"
          ref={(el) => { this.code_select = el }} />
        <Select
          tabIndex={0}
          value={section}
          onChange={this.changeSection}
          options={section_options}
          placeholder="Select Section"
          openMenuOnFocus={true}
          tabSelectsValue={false}
          isDisabled={section_options.length == 0}
          className="course-select"
          ref={(el) => { this.section_select = el }} />
        <img src="./assets/cross.png"
          style={{verticalAlign: "middle", cursor: "pointer"}}
          width="16" height="16"
          onClick={() => {this.props.removeEntry(this.props.index)}} />
      </div>
    ); 
  }
}

export default CourseSelector;
