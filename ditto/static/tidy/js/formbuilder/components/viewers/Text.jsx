import React, { PropTypes } from 'react';

export default class Text extends React.Component {

  static propTypes = {
    question: PropTypes.string.isRequired,
    isRequired: PropTypes.bool,
    text: PropTypes.shape({
      maxChars: PropTypes.number,
      maxWords: PropTypes.number,
      isMultiline: PropTypes.bool
    })
  }

  render() {
    return (
      <p>
        <label>
          {this.props.question}?{this.props.isRequired ? ' *' : ' '}
          {this.props.text.isMultiline ?
           <textarea/>
           :
           <input type="text" />
           }
        </label>
      </p>
    );
  }
}
