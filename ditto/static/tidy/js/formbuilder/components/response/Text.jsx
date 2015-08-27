import React, { PropTypes } from 'react';

export default class Text extends React.Component {
  static propTypes = {
    question: PropTypes.string.isRequired,
    number: PropTypes.number,
    isRequired: PropTypes.bool,
    response: PropTypes.string.isRequired
  }

  render() {
    return (
      <div>
        <p>Q{this.props.number}. {this.props.question}?{this.props.isRequired ? ' *' : null}</p>
        <p>{this.props.response}</p>
      </div>
    );
  }
}
