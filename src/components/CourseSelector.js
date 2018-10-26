import React from "react";

import Select, { createFilter, components } from "react-select";

class CourseSelector extends React.Component {
  constructor(props) {
    super(props);

    this.changeSubject = this.changeSubject.bind(this);
    this.changeCode = this.changeCode.bind(this);
    this.changeSection = this.changeSection.bind(this);
  }

  changeSubject(selected) {
    this.props.updateEntry(
      this.props.index,
      { subject: selected, code: null, section: null },
      () => this.code_select.focus()
    );
  }

  changeCode(selected) {
    this.props.updateEntry(
      this.props.index,
      { code: selected, section: null },
      () => this.section_select.focus()
    );
  }

  changeSection(selected) {
    this.props.updateEntry(
      this.props.index,
      { section: selected.length === 0 ? null : selected },
      () => (selected.length === 0 ? null : this.props.focusNextEntry())
    );
  }

  focusSubject() {
    this.subject_select.focus();
  }

  render() {
    const { subject, code, section } = this.props;

    let code_options = this.props.getCodes(subject);
    let section_options = this.props.getSections(subject, code);

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
          classNamePrefix="react-select"
          filterOption={createFilter({ matchFrom: "start" })}
          ref={el => {
            this.subject_select = el;
          }}
        />
        <Select
          tabIndex={0}
          value={code}
          onChange={this.changeCode}
          options={code_options}
          placeholder="Select Course"
          openMenuOnFocus={true}
          tabSelectsValue={false}
          isDisabled={code_options.length === 0}
          className="course-select"
          classNamePrefix="react-select"
          filterOption={createFilter({ matchFrom: "start" })}
          ref={el => {
            this.code_select = el;
          }}
        />
        <Select
          tabIndex={0}
          value={section}
          onChange={this.changeSection}
          options={section_options}
          placeholder="Select Section"
          openMenuOnFocus={true}
          tabSelectsValue={false}
          isDisabled={section_options.length === 0}
          className="course-select"
          classNamePrefix="react-select"
          filterOption={createFilter({ matchFrom: "start" })}
          components={{
            Option: props => {
              return (
                <div>
                  <components.Option {...props}>
                    {props.children}
                    <span
                      className={
                        props.data.time.indexOf(", ") > -1 ? "multiple" : ""
                      }
                    >
                      {props.data.time.split(", ").map((time, index) => {
                        return [time, <br key={index} />];
                      })}
                    </span>
                  </components.Option>
                </div>
              );
            }
          }}
          isOptionDisabled={option => option.already_entered}
          ref={el => {
            this.section_select = el;
          }}
        />
        <img
          src={process.env.PUBLIC_URL + "/assets/cross.png"}
          alt="Delete entry"
          style={{ verticalAlign: "middle", cursor: "pointer" }}
          width="16"
          height="16"
          onClick={() => {
            this.props.removeEntry(this.props.index);
          }}
        />
      </div>
    );
  }
}

export default CourseSelector;
