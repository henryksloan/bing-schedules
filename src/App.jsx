import React from "react";
import ReactDOM from "react-dom";

import Header from './Header.jsx'
import CourseContainer from './CourseContainer.jsx'

class App extends React.Component {
  constructor (props) {
    super(props);
  }

  render() {
    return (
      <div>
        <Header />
        <CourseContainer />
      </div>
    );
  }
}

var mountNode = document.getElementById("app");
ReactDOM.render(<App />, mountNode);
