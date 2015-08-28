import React, { PropTypes } from 'react';
import ControlErrors from '../editors/renderer/ControlErrors';
import { controlRowErrorClassNames } from '../editors/renderer/utils';
import ControlValidationIcon from '../editors/renderer/ControlValidationIcon';

export default class Choice extends React.Component {

  render() {
    let question = this.props.question;
    let answer = this.props.value;
    const type = question.choice.isMultiple.get() ? 'checkbox' : 'radio';
    return (
      <div>
        <div
              className={controlRowErrorClassNames(answer.choice.errors, {'form-group': true})}
                >
          <label className="control-label">
            {question.question.get() || <p><em>Please enter question</em></p>}
            {question.choice.isMultiple.get() ?
             <small> (You can select more than one)</small>
             : null
             }
             {question.isRequired.get() ? ' *' : ''}
          </label>
          <ControlValidationIcon controlID={this.ID} errors={answer.choice.errors} />
        </div>
        {question.choice.options.get() ?
         question.choice.options.get().map(option => {
            return (
              <div
                      className={controlRowErrorClassNames(answer.choice.errors, {[type]: true})}
                      >
              <label key={option}>
              <input
              type={type}
                      name={question.question.get()}
                      value={option}
              checked={this._isChecked(option)}
                      onChange={this._onOptionChange}
              />
              {' '}{option}
              </label>
              </div>
            );
         }) : <p><em>Please add at least two options</em></p>}
              <div
                      className={controlRowErrorClassNames(answer.choice.errors)}
                      >
                <ControlErrors errors={answer.choice.errors}/>
              </div>
        {question.choice.hasOther.get() ?
         (
           <div className="form-group">
           <label>
           {question.choice.otherText.get() || 'Other'}:{' '}
           </label>
           <input
           className="form-control"
           type="text"
           value={answer.otherText.get()}
           onChange={(e) => answer.otherText.set(e.target.value)}
           />
           </div>
         ) : null}
      </div>
    );
  }

  _onOptionChange = (e) => {
    let choice = this.props.question.choice;
    let answer = this.props.value;
    if (!choice.isMultiple.get()) {
      answer.choice.set(e.target.value);
      return;
    }
    if (e.target.checked) {
      answer.choice.add(e.target.value);
    } else {
      console.log('removing', option);
      answer.choice.removeX(e.target.value);
    }
  }

  _isChecked(option) {
    let value = this.props.value.choice.get();
    if (!this.props.question.choice.isMultiple.get()) {
      return value === option;
    }
    return value.indexOf(option) !== -1;
  }
}
