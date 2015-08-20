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
        <div className="form-group">
          <label>
            {this.props.question}
            {this.props.choice.isMultiple ?
             <small> (You can select more than one)</small>
             : null
             }
             {this.props.isRequired ? ' *' : ''}
          </label>
        </div>
          {this.props.choice.options.map(option => {
            return (
              <div className={type}>
              <label key={option}>
              <input type={type} name={this.props.question} />
              {' '}{option}
              </label>
              </div>
            );
           })}
        {this.props.choice.hasOther ?
         (
           <div className="form-group">
           <label>
           {this.props.choice.otherText || 'Other'}:{' '}
           </label>
           <input className="form-control" type="text" />
           </div>
         ) : null}
      </div>
    );
  }
}
