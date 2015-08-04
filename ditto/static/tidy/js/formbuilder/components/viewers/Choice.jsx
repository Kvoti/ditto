import React from 'react';

export default class Choice extends React.Component {
  static propTypes = {
    question: React.PropTypes.string.isRequired,
    isRequired: React.PropTypes.bool,
    choice: React.PropTypes.shape({
      options: React.PropTypes.arrayOf(
        React.PropTypes.string).isRequired,
      isMultiple: React.PropTypes.bool,
      hasOther: React.PropTypes.bool,
      otherText: React.PropTypes.string
    })
  }

  render() {
    const type = this.props.choice.isMultiple ? 'checkbox' : 'radio';
    return (
      <div>
        <p>
          {this.props.question}
          {this.props.choice.isMultiple ?
           <small> (You can select more than one)</small>
           : null
           }
           {this.props.isRequired ? ' *' : ''}
        </p>
        <ul>
          {this.props.choice.options.map(option => {
            return (
              <li key={option}>
              <label>
              <input type={type} name={this.props.question} />
              {option}
              </label>
              </li>
            );
           })}
        </ul>
        {this.props.choice.hasOther ?
         (
           <label>
           {this.props.choice.otherText || 'Other'}:{' '}
           <input type="text" />
           </label>
         ) : null}
      </div>
    );
  }
}
