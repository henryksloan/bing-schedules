import React from "react";

import "../stylesheets/WeekView.css";

class WeekView extends React.Component {
  constructor(props) {
    super(props);

    let weekend = false;
    this.props.courses.some(course => {
      if (course.days.includes("S") || course.days.includes("U")) {
        weekend = true;
        return false;
      }
      return true;
    });

    if (this.props.noWeekend && !weekend) {
      this.weekdays = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
      ]
    }
    else {
      this.weekdays = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ];
    }
    this.days_header = this.weekdays.map((day, index) => {
      return (
        <th key={index + 1} className="weekview-cell-label">
          <span>{day.substr(0, 3)}</span>
        </th>
      );
    });
    this.days_header.splice(
      0,
      0,
      <th key={0} className="weekview-cell-label" />
    );

    // TODO: Handle the case where the last end time is an exact hour
    // i.e. Should an empty hour be shown?
    this.hour_min = null;
    this.hour_max = null;
    this.props.courses.forEach(course => {
      let start_hour = new Date(
        "1/1/1970 " + course.time_start.toUpperCase().trim()
      ).getHours();
      if (start_hour < this.hour_min || this.hour_min == null)
        this.hour_min = start_hour;

      let end_hour = new Date(
        "1/1/1970 " + course.time_end.toUpperCase().trim()
      ).getHours();
      if (end_hour > this.hour_max || this.hour_max == null)
        this.hour_max = end_hour;
    });

    let overrides = 0;
    if (this.props.endHour && this.props.endHour > this.hour_max) {
      this.hour_max = this.props.endHour;
      overrides += 1;
    }

    if (this.props.startHour && this.props.startHour < this.hour_min) {
      this.hour_min = this.props.startHour;
      overrides += 1;
    }

    // console.log(this.hour_max - this.hour_min, this.props.optimalSize, this.hour_max - this.hour_min + 1 - this.props.optimalSize);
    if (overrides > 0) this.hour_min += (this.hour_max - this.hour_min) - (this.props.endHour - this.props.startHour);

    // TODO: IMPORTANT -- Fix times that pass midnight into another day
    let row_groups = [];
    for (let i = this.hour_min; i <= this.hour_max; i++) {
      let row_group = [];
      for (let j = 0; j < 4; j++) {
        let row = [];
        if (j === 0) {
          row.push(
            <td key={0} rowSpan={4} className="weekview-cell-label">
              {((i + 11) % 12) + 1 + (i >= 12 ? "PM" : "AM")}
            </td>
          );
        }

        for (let k = 0; k < this.weekdays.length; k++) {
          row.push(<td key={this.weekdays[k]} className="weekview-cell-empty" />);
        }
        row_group.push(row);
      }
      row_groups.push(row_group);
    }
    this.row_groups_default = row_groups;

    this.state = { row_groups: row_groups };

    this.addBlock = this.addBlock.bind(this);
    this.addBlockAtTime = this.addBlockAtTime.bind(this);
  }

  componentDidMount() {
    if (!this.props.courses) return;
    const day_codes = "MTWRFSU";
    this.props.courses.forEach(course => {
      for (let i = 0; i < course.days.length; i++) {
        this.addBlockAtTime(
          day_codes.indexOf(course.days.charAt(i)),
          course.time_start,
          course.time_end,
          <span key={i}><b>{course.name}</b><br />{course.course}<br />{course.times}</span>
        );
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ row_groups: this.row_groups_default });
    const day_codes = "MTWRFSU";
    nextProps.courses.forEach(course => {
      for (let i = 0; i < course.days.length; i++) {
        this.addBlockAtTime(
          day_codes.indexOf(course.days.charAt(i)),
          course.time_start,
          course.time_end,
          <span key={i}><b>{course.name}</b><br />{course.course}<br />{course.times}</span>
        );
      }
    });
  }

  // Adds a cell of rowSpan row_span at:
  // (day_index)th day column of the (row_index)th row in the (group_index)th row group
  // containing the inner html provided by inner_html
  // addBlockAtTime wraps this for ease of use
  addBlock(day_index, group_index, row_index, row_span, inner_html) {
    let day_fixed = row_index === 0 ? day_index + 1 : day_index;
    let row_groups = this.state.row_groups;
    if (!row_groups[group_index]
      || !row_groups[group_index][row_index]
      || !row_groups[group_index][row_index][day_fixed]) {
      return;
    }
    let key = row_groups[group_index][row_index][day_fixed].key;
    row_groups[group_index][row_index][day_fixed] = (
      <td rowSpan={row_span} style={{ backgroundColor: "#ccc", height: "100%" }} key={key}>
        <span><div>{inner_html}</div></span>
      </td>
    );

    for (let i = 1; i < row_span; i++) {
      let row =
        row_groups[group_index + Math.floor((row_index + i) / 4)][
        (row_index + i) % 4
          ];
      row[day_index + ((row_index + i) % 4 === 0 ? 1 : 0)] = null;
    }

    this.setState({ row_groups: row_groups });
  }

  // Adds a cell:
  // (day_index)th day column, spanning from time_start to time_end, rounded to the nearest 15 minutes
  // containing the inner html provided by inner_html
  // Times are in the form H:MM {AM | PM} (space required before suffix)
  // TODO: Don't require space before suffix
  addBlockAtTime(day_index, time_start, time_end, inner_html) {
    let start_date = new Date("1/1/1970 " + time_start.toUpperCase().trim());
    let start_obj = {
      hour: start_date.getHours(),
      quarter: Math.round(start_date.getMinutes() / 15)
    };

    let end_date = new Date("1/1/1970 " + time_end.toUpperCase().trim());
    let end_obj = {
      hour: end_date.getHours(),
      quarter: Math.round(end_date.getMinutes() / 15)
    };

    let group_index = start_obj.hour - this.hour_min;
    if (group_index < 0) group_index = 24 + group_index;
    let row_index = start_obj.quarter;
    let row_span = 0;

    // Add 4 rows for every whole hour greater
    if (end_obj.hour > start_obj.hour) {
      row_span += 4 * (end_obj.hour - start_obj.hour - 1);
    }
    row_span += 4 - start_obj.quarter + end_obj.quarter;

    this.addBlock(day_index, group_index, row_index, row_span, inner_html);
  }

  render() {
    let row_groups = this.state.row_groups;

    return (
      <table className="weekview-table">
        <colgroup>
          <col style={{ width: "50px" }} />
          {this.weekdays.map((_, index) => { return <col key={index} style={{ width: "100px" }} /> })}
        </colgroup>

        <thead>
          {this.props.title ?
            <tr className="weekview-title">
              <td colSpan={this.weekdays.length + 1}>{this.props.title}</td>
            </tr>
            :
            null
          }
          <tr>{this.days_header}</tr>
        </thead>
        <tbody>
          {row_groups.map((row_group) => {
            return row_group.map((row, row_index) => {
              return <tr key={"row" + row_index}>{row}</tr>;
            });
          })}
        </tbody>
      </table>
    );
  }
}

export default WeekView;
