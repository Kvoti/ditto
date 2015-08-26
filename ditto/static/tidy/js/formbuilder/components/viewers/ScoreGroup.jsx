import React, { PropTypes } from 'react';

import ControlErrors from '../editors/renderer/ControlErrors';
import { controlRowErrorClassNames } from '../editors/renderer/utils';
import ControlValidationIcon from '../editors/renderer/ControlValidationIcon';

export default class ScoreGroup extends React.Component {

  static propTypes = {
    question: PropTypes.string.isRequired,
    isRequired: PropTypes.bool,
    scoregroup: PropTypes.shape({
      labels: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string,
          defaultScore: PropTypes.number
        })
      ),
      items: PropTypes.arrayOf(
        PropTypes.shape({
          text: PropTypes.string.isRequired,
          // TODO validate score labels and values are same length
          scores: PropTypes.arrayOf(PropTypes.number).isRequired
        }).isRequired
      ).isRequired
    }).isRequired
  }

  render() {
    console.log('scores', this.props.value);
    return (
      <div
              className={controlRowErrorClassNames(this.props.errors, {'form-group': true})}
      >
      
      <table className="table table-striped" style={{width: 'auto'}}>
        <caption>
          {this.props.question}{this.props.isRequired ? '*' : ''}
        </caption>
        <thead>
          <tr>
            <th></th>
            {this.props.scoregroup.labels && this.props.scoregroup.labels.map((label, i) => {
              return (
                <th key={i}>{label.label}</th>
              );
             })}
          </tr>
        </thead>
        <tbody>
          {this.props.scoregroup.items && this.props.scoregroup.items.map((item, i) => {
            return (
              <tr>
              <td>
              {item.text}
              </td>
              {this.props.scoregroup.labels && this.props.scoregroup.labels.map((label) => {
                return (
                  <td>
                  <input
                  name={item.text}
                  type="radio"
                  onChange={() => this.props.onChange(i, label.label)}
                  checked={this.props.value[i] === label.label}
                  />
                  </td>
                );
              })}
              </tr>
            );
           })}
        </tbody>
      </table>
      <ControlValidationIcon controlID={this.ID} errors={this.props.errors} />
      <ControlErrors errors={this.props.errors}/>
      </div>
    );
  }
}
