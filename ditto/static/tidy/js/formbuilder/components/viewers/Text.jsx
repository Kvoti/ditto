import React from 'react';

export default class Text extends React.Component {

  static propTypes = {
    question: React.PropTypes.string.isRequired,
    isRequired: React.PropTypes.bool
  }

  render() {
    return (
      <p>
        <label>
          {this.props.question}?{this.props.isRequired ? ' *' : ' '}
          <input type="text" />
        </label>
      </p>
    );
  }
}
