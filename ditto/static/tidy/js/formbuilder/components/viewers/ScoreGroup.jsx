import React from 'react';

export default class ScoreGroup extends React.Component {

  static propTypes = {
    questionText: React.PropTypes.string.isRequired,
    isRequired: React.PropTypes.bool,
    // TODO validate score labels and values are same length
    scores: React.PropTypes.arrayOf(
      React.PropTypes.shape(React.PropTypes.string),
    ).isRequired,
    questions: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        text: React.PropTypes.string,
        scores: React.PropTypes.arrayOf(React.PropTypes.number)
      })
    )
  }

  render() {
    const scores = this.props.scores || [];
    const scoreLabels = scores.map((score, i) => {
      const classes = React.addons.classSet({
        'col-md-1': true,
        'col-md-offset-3': i === 0
      });
      return (
        <div className={classes}>{score.label}</div>
      );
    });
    const questions = this.props.questions.map((question, i) => {
      const scoreInputs = scores.map(score => {
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
          {this.props.questionText}{this.props.isRequired ? '*' : ''}
        </p>
        <div className="row">
          {scoreLabels}
        </div>
        {questions}
      </div>
    );
  }
}
