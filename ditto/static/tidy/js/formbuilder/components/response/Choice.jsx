import React, { PropTypes } from 'react';

export default class Choice extends React.Component {
  static propTypes = {
    question: PropTypes.string.isRequired,
    isRequired: PropTypes.bool,
    isMultiple: PropTypes.bool,
    options: PropTypes.arrayOf(
      PropTypes.string
    ).isRequired,
    response: PropTypes.shape({
      choice: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string)
      ]).isRequired,
      otherText: PropTypes.string
    })
  }

  render() {
    return (
      <div>
        <p>Q{this.props.number}. {this.props.question}{this.props.isRequired ? ' *' : null}</p>
        <ul>
          {this.props.options.map(option => {
            return (
              <li>
              {option}
              {this._isChecked(option) ? ' \u2713' : null}
              </li>
            )}
           )}
        </ul>
        {this.props.response.otherText ? <p><strong>Other:</strong> {this.props.response.otherText}</p> : null}
      </div>
    );
  }

  _isChecked(option) {
    if (!this.props.isMultiple) {
      return this.props.response.choice === option;
    }
    return this.props.response.choice.indexOf(option) !== -1;
  }
}
