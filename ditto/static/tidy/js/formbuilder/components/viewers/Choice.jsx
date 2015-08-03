import React from 'react';

export default class Choice extends React.Component {
  static propTypes = {
    question: React.PropTypes.string.isRequired,
    choice: React.PropTypes.shape({
      options: React.PropTypes.arrayOf(
        React.PropTypes.string).isRequired
    }),
    isMultiple: React.PropTypes.bool,
    isRequired: React.PropTypes.bool,
    hasOther: React.PropTypes.bool,
    otherText: React.PropTypes.string
  }

  render() {
    let other;
    const type = this.props.isMultiple ? 'checkbox' : 'radio';
    const options = this.props.choice.options.map(option => {
      return (
        <li key={option}>
          <label>
            <input type={type} name={this.props.question} />
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
        <p>{this.props.question}{this.props.isRequired ? ' *' : ''}</p>
        <ul>
          {options}
        </ul>
        {other}
      </div>
    );
  }
}
