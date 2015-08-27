import React, { PropTypes } from 'react';

export default class ScoreGroup extends React.Component {

  static propTypes = {
    question: PropTypes.string.isRequired,
    isRequired: PropTypes.bool,
    labels: PropTypes.arrayOf(
      PropTypes.string
    ).isRequired,
    items: PropTypes.arrayOf(
      PropTypes.string
    ).isRequired
    // TODO response:
  }

  render() {
    console.log(this.props.response);
    return (
      <table className="table table-striped" style={{width: 'auto'}}>
        <caption>
          {this.props.question}{this.props.isRequired ? ' *' : ''}
        </caption>
        <thead>
          <tr>
            <th></th>
            {this.props.labels.map((label, i) => {
              return (
                <th key={i}>{label}</th>
              );
             })}
          </tr>
        </thead>
        <tbody>
          {this.props.items.map((item, i) => {
            return (
              <tr>
              <td>
              {item}
              </td>
              {this.props.labels.map((label, j) => {
                return (
                  <td>
                  {this.props.response[i] === label ? ' \u2713' : null}
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
