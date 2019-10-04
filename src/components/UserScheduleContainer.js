import React from "react";
import CourseContainer from "./CourseContainer";
import WeekView from "./WeekView";

class UserScheduleContainer extends React.Component {
  render() {
    return (
      <div>
        {(this.props.edit_schedule || !this.props.schedule) ?
          <CourseContainer
            data={this.props.data}
            user={this.props.user}
            initial={this.props.schedule}
            getTime={(subject, code, section) => {
              let times = this.props.getField(subject, code, section, "time");
              console.log(times);
              return this.props.getField(subject, code, section, "days").map((day, i) => {
                return day + " " + times[i] || times[0];
              }).join(", ");
            }}
            onSubmit={this.props.onSubmit} />
          :
          <WeekView noWeekend={this.props.noWeekend}
            courses={this.props.courses} startHour={9} endHour={18} />
        }
      </div>
    );
  }
}

export default UserScheduleContainer;
