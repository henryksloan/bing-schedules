import React from "react";

import "../stylesheets/Card.css";

class Card extends React.Component {
  render() {
    return (
      <div className="card">
        <div className="card-header">{this.props.title}</div>
        <div className="card-content">{this.props.children}</div>
      </div>
    );
  }
}

export default Card;
