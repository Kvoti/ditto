import React from 'react';
import classNames from 'classnames';

export default class ScoreGroup extends React.Component {

  static propTypes = {
    question: React.PropTypes.string.isRequired,
    isRequired: React.PropTypes.bool,
    scoregroup: React.PropTypes.shape({
      labels: React.PropTypes.arrayOf(React.PropTypes.string),
      items: React.PropTypes.arrayOf(
        React.PropTypes.shape({
          text: React.PropTypes.string.isRequired,
          // TODO validate score labels and values are same length
          scores: React.PropTypes.arrayOf(React.PropTypes.number).isRequired
        }).isRequired
      ).isRequired
    }).isRequired
  }

  render() {
    return (
      <table className="table table-striped" style={{width: 'auto'}}>
        <caption>
          {this.props.question}{this.props.isRequired ? '*' : ''}
        </caption>
        <tr>
          <th></th>
          {this.props.scoregroup.labels.map((label, i) => {
            return (
              <th key={label}>{label}</th>
            );
           })}
        </tr>
        {this.props.scoregroup.items.map(item => {
          return (
            <tr>
            <td>
            {item.text}
            </td>
            {this.props.scoregroup.labels.map(() => {
              return (
                <td>
                <input name={item.text} type="radio" />
                </td>
              );
            })}
            </tr>
            );
         })}
      </table>
    );
  }
}
