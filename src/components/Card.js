import React from "react";

import "../stylesheets/Card.css";

class Card extends React.Component {
  render() {
    return (
      <div className="card">
        <div className="card-header">
          <span style={this.props.editButton ? {lineHeight: "30px"} : null}>{this.props.title}</span>
          {this.props.editButton}
        </div>
        <div className="card-content">{this.props.children}</div>
      </div>
    );
  }
}

export default Card;
