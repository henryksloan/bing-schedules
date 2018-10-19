import React from "react";

import '../stylesheets/WeekView.css'

class WeekView extends React.Component {
  constructor(props) {
    super(props);

    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    this.days_header = weekdays.map((day, index) => {
      return (
          <th key={index + 1} className="weekview-cell-label">
            <span>{day.substr(0, 3)}</span>
          </th>
      );
    });
    this.days_header.splice(0, 0, <th key={0} className="weekview-cell-label"></th>);

    // TODO: Handle the case where the last end time is an exact hour
    // i.e. Should an empty hour be shown?
    this.hour_min = null;
    this.hour_max = null;
    this.props.courses.forEach((course) => {
      var start_hour = new Date('1/1/1970 ' + course.time_start.toUpperCase().trim()).getHours();
      if (start_hour < this.hour_min || this.hour_min == null) this.hour_min = start_hour;

      var end_hour = new Date('1/1/1970 ' + course.time_end.toUpperCase().trim()).getHours();
      if (end_hour > this.hour_max || this.hour_max == null) this.hour_max = end_hour;
    });

    if (this.props.startHour && this.props.startHour <= this.hour_min) {
      this.hour_min = this.props.startHour;
    }

    if (this.props.endHour && this.props.endHour >= this.hour_max) {
      this.hour_max = this.props.endHour;
    }

    // TODO: IMPORTANT -- Fix times that pass midnight into another day
    var row_groups = [];
    for (var i = this.hour_min; i <= this.hour_max; i++) {
      var row_group = [];
      for (var j = 0; j < 4; j++) {
        var row = [];
        if (j === 0) {
          row.push(<td key={0} rowSpan={4} className="weekview-cell-label">
            {((i + 11) % 12 + 1) + (i >= 12 ? "PM" : "AM")}
          </td>);
        }

        for (var k = 0; k < weekdays.length; k++) {
          row.push(<td key={weekdays[k]} className="weekview-cell-empty"></td>);
        }
        row_group.push(row);
      }
      row_groups.push(row_group);
    }
    this.row_groups_default = row_groups;

    this.state = {row_groups: row_groups};

    this.addBlock = this.addBlock.bind(this);
    this.addBlockAtTime = this.addBlockAtTime.bind(this);
  }

  componentDidMount() {
    if (!this.props.courses) return;
    const day_codes = "MTWRFSU";
    this.props.courses.forEach((course) => {
      for (var i = 0; i < course.days.length; i++) {
        this.addBlockAtTime(day_codes.indexOf(course.days.charAt(i)), course.time_start, course.time_end, course.name);
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({row_groups: this.row_groups_default});
    const day_codes = "MTWRFSU";
    nextProps.courses.forEach((course) => {
      for (var i = 0; i < course.days.length; i++) {
        this.addBlockAtTime(day_codes.indexOf(course.days.charAt(i)), course.time_start, course.time_end, course.name);
      }
    });
  }

  // Adds a cell of rowSpan row_span at:
  // (day_index)th day column of the (row_index)th row in the (group_index)th row group
  // containing the inner html provided by inner_html
  // addBlockAtTime wraps this for ease of use
  addBlock(day_index, group_index, row_index, row_span, inner_html) {
    var day_fixed = (row_index === 0) ? day_index+1 : day_index;
    var row_groups = this.state.row_groups;
    var key = row_groups[group_index][row_index][day_fixed].key;
    row_groups[group_index][row_index][day_fixed] = (
      <td rowSpan={row_span}
        style={{backgroundColor: "#ccc"}}
        key={key}><div>{inner_html}</div></td>
    );

    for (var i = 1; i < row_span; i++) {
      var row = row_groups[group_index + Math.floor((row_index + i) / 4)][(row_index + i) % 4];
      row[day_index + (((row_index + i) % 4 === 0) ? 1 : 0)] = null;
    }

    this.setState({row_groups: row_groups});
  }

  // Adds a cell:
  // (day_index)th day column, spanning from time_start to time_end, rounded to the nearest 15 minutes
  // containing the inner html provided by inner_html
  // Times are in the form H:MM {AM | PM} (space required before suffix)
  // TODO: Don't require space before suffix
  addBlockAtTime(day_index, time_start, time_end, inner_html) {
    var start_date = new Date('1/1/1970 ' + time_start.toUpperCase().trim());
    var start_obj = {hour: start_date.getHours(),
                     quarter: Math.round(start_date.getMinutes() / 15)};

    var end_date = new Date('1/1/1970 ' + time_end.toUpperCase().trim());
    var end_obj = {hour: end_date.getHours(),
                   quarter: Math.round(end_date.getMinutes() / 15)};

    var group_index = start_obj.hour - this.hour_min;
    if (group_index < 0) group_index = 24 + group_index;
    var row_index = start_obj.quarter;
    var row_span = 0;

    // Add 4 rows for every whole hour greater
    if (end_obj.hour > start_obj.hour) {
      row_span += 4 * (end_obj.hour - start_obj.hour - 1);
    }
    row_span += (4 - start_obj.quarter) + end_obj.quarter;

    this.addBlock(day_index, group_index, row_index, row_span, inner_html);
  }

  render() {
    var row_groups = this.state.row_groups;

    return (
      <div>
        <table className="weekview-table">
          <colgroup>
            <col style={{width: "50px"}} />
            <col style={{width: "100px"}} />
            <col style={{width: "100px"}} />
            <col style={{width: "100px"}} />
            <col style={{width: "100px"}} />
            <col style={{width: "100px"}} />
            <col style={{width: "100px"}} />
            <col style={{width: "100px"}} />
          </colgroup>

          <thead>
            <tr className="weekview-title"><td colSpan={8}>{this.props.title}</td></tr>
            <tr>{this.days_header}</tr>
          </thead>
          <tbody>
            {row_groups.map((row_group, group_index) => {
              return row_group.map((row, row_index) => {
                return <tr key={"row" + row_index}>{row}</tr>;
              });
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

export default WeekView;
