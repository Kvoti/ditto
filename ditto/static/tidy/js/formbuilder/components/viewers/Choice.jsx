import React from 'react';

export default class Choice extends React.Component {
  static propTypes = {
    questionText: React.PropTypes.string.isRequired,
    choices: React.PropTypes.arrayOf(
      React.PropTypes.string).isRequired,
    isMultiple: React.PropTypes.bool,
    isRequired: React.PropTypes.bool,
    hasOther: React.PropTypes.bool,
    otherText: React.PropTypes.string
  }

  render() {
    let other;
    const type = this.props.isMultiple ? 'checkbox' : 'radio';
    const options = this.props.choices.map(option => {
      return (
        <li key={option}>
          <label>
            <input type={type} name={this.props.questionText} />
            {option}
          </label>
        </li>
      );
    });
    if (this.props.hasOther) {
      other = (
        <label>
          {this.props.otherText || 'Other'}:{' '}
          <input type="text" />
        </label>
      );
    }
    return (
      <div>
        <p>{this.props.questionText}{this.props.isRequired ? ' *' : ''}</p>
        <ul>
          {options}
        </ul>
        {other}
      </div>
    );
  }
}
