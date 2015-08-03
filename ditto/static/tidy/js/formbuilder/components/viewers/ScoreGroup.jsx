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
    const scoreLabels = this.props.scoregroup.labels.map((label, i) => {
      const classes = classNames({
        'col-md-1': true,
        'col-md-offset-3': i === 0
      });
      return (
        <div key={label} className={classes}>{label}</div>
      );
    });
    const items = this.props.scoregroup.items.map((question, i) => {
      const scoreInputs = scoreLabels.map(() => {
        return (
          <div className="col-md-1">
            <input name={question.text} type="radio" />
          </div>
        );
      });
      return (
        <div className="row">
          <div className="col-md-3">{question.text}</div>
          {scoreInputs}
        </div>
      );
    });
    return (
      <div>
        <p>
          {this.props.question}{this.props.isRequired ? '*' : ''}
        </p>
        <div className="row">
          {scoreLabels}
        </div>
        {items}
      </div>
    );
  }
}
