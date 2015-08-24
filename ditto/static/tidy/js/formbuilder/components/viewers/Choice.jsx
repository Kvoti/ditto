import React, { PropTypes } from 'react';
import ControlErrors from '../editors/renderer/ControlErrors';

export default class Choice extends React.Component {
  static propTypes = {
    question: PropTypes.string.isRequired,
    isRequired: PropTypes.bool,
    choice: PropTypes.shape({
      options: PropTypes.arrayOf(
        PropTypes.string).isRequired,
      isMultiple: PropTypes.bool,
      hasOther: PropTypes.bool,
      otherText: PropTypes.string
    }),
    //value: PropTypes.string, // TODO string or array, prob best to split multiple choice out?
    errors: PropTypes.arrayOf(PropTypes.string) // TODO or null
  }

  render() {
    const type = this.props.choice.isMultiple ? 'checkbox' : 'radio';
    return (
      <div>
        <div className="form-group">
          <label>
            {this.props.question || <p><em>Please enter question</em></p>}
            {this.props.choice.isMultiple ?
             <small> (You can select more than one)</small>
             : null
             }
             {this.props.isRequired ? ' *' : ''}
          </label>
        </div>
        {this.props.choice.options ?
         this.props.choice.options.map(option => {
            return (
              <div className={type}>
              <label key={option}>
              <input
              type={type}
                      name={this.props.question}
                      value={option}
              checked={this._isChecked(option)}
                      onChange={this.props.onChange}
              />
              {' '}{option}
              </label>
              </div>
            );
         }) : <p><em>Please add at least two options</em></p>}
        <ControlErrors errors={this.props.errors}/>
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

  _isChecked(option) {
    if (!this.props.choice.isMultiple) {
      return this.props.value === option;
    }
    return this.props.value.indexOf(option) !== -1;
  }
}
