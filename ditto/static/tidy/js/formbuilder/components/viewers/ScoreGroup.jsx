import React, { PropTypes } from 'react';

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
    return (
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
          {this.props.scoregroup.items && this.props.scoregroup.items.map(item => {
            return (
              <tr>
              <td>
              {item.text}
              </td>
              {this.props.scoregroup.labels && this.props.scoregroup.labels.map(() => {
                return (
                  <td>
                  <input name={item.text} type="radio" />
                  </td>
                );
              })}
              </tr>
            );
           })}
        </tbody>
      </table>
    );
  }
}
