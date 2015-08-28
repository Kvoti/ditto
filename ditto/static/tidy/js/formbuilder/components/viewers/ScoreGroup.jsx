import React, { PropTypes } from 'react';

import ControlErrors from '../editors/renderer/ControlErrors';
import { controlRowErrorClassNames } from '../editors/renderer/utils';
import ControlValidationIcon from '../editors/renderer/ControlValidationIcon';

export default class ScoreGroup extends React.Component {

  render() {
    let question = this.props.question;
    let answer = this.props.value;
    return (
      <div
              className={controlRowErrorClassNames(answer.errors, {'form-group': true})}
      >
      
      <table className="table table-striped" style={{width: 'auto'}}>
        <caption>
          {question.question.get()}{question.isRequired.get() ? '*' : ''}
        </caption>
        <thead>
          <tr>
            <th></th>
            {question.scoregroup.labels.get() && question.scoregroup.labels.get().map((label, i) => {
              return (
                <th key={label.label}>{label.label}</th>
              );
             })}
          </tr>
        </thead>
        <tbody>
          {question.scoregroup.items.get() && question.scoregroup.items.get().map((item, i) => {
            return (
              <tr key={item.text}>
              <td>
              {item.text}
              </td>
              {question.scoregroup.labels.get() && question.scoregroup.labels.get().map(label => {
                return (
                  <td>
                  <input
                  name={item.text}
                  type="radio"
                  onChange={() => answer.setChoice(i, label.label)}
                  checked={answer.get()[i] === label.label}
                  />
                  </td>
                );
              })}
              </tr>
            );
           })}
        </tbody>
      </table>
      <ControlValidationIcon controlID={this.ID} errors={answer.errors} />
      <ControlErrors errors={answer.errors}/>
      </div>
    );
  }
}
