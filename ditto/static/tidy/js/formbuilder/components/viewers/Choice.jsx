import React, { PropTypes } from 'react';
import ControlErrors from '../editors/renderer/ControlErrors';
import { controlRowErrorClassNames } from '../editors/renderer/utils';
import ControlValidationIcon from '../editors/renderer/ControlValidationIcon';

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
    console.log('choice value', this.props.value);
    const type = this.props.choice.isMultiple ? 'checkbox' : 'radio';
    return (
      <div>
        <div
              className={controlRowErrorClassNames(this.props.errors, {'form-group': true})}
                >
          <label className="control-label">
            {this.props.question || <p><em>Please enter question</em></p>}
            {this.props.choice.isMultiple ?
             <small> (You can select more than one)</small>
             : null
             }
             {this.props.isRequired ? ' *' : ''}
          </label>
          <ControlValidationIcon controlID={this.ID} errors={this.props.errors} />
        </div>
        {this.props.choice.options ?
         this.props.choice.options.map(option => {
            return (
              <div
                      className={controlRowErrorClassNames(this.props.errors, {[type]: true})}
                      >
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
              <div
                      className={controlRowErrorClassNames(this.props.errors)}
                      >
                <ControlErrors errors={this.props.errors}/>
              </div>
        {this.props.choice.hasOther ?
         (
           <div className="form-group">
           <label>
           {this.props.choice.otherText || 'Other'}:{' '}
           </label>
           <input
           className="form-control"
           type="text"
           value={this.props.value.otherText}
           onChange={this.props.onChange}
           />
           </div>
         ) : null}
      </div>
    );
  }

  _isChecked(option) {
    let value = this.props.value.choice;
    if (!this.props.choice.isMultiple) {
      return value === option;
    }
    return value.indexOf(option) !== -1;
  }
}
