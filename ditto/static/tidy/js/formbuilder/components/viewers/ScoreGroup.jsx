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
      <div>
        <p>
          {this.props.question}{this.props.isRequired ? '*' : ''}
        </p>
        <div className="row">
          {this.props.scoregroup.labels.map((label, i) => {
            return (
              <div key={label} className={this._labelClass(i)}>{label}</div>
            );
           })}
        </div>
        {this.props.scoregroup.items.map(item => {
          return (
            <div className="row">
            <div className="col-md-3">
            {item.text}
            </div>
            {this.props.scoregroup.labels.map(() => {
              return (
                <div className="col-md-1">
                <input name={item.text} type="radio" />
                </div>
              );
            })}
            </div>
            );
         })}
      </div>
    );
  }

  _labelClass(i) {
    return classNames({
      'col-md-1': true,
      'col-md-offset-3': i === 0
    });
  }
}
