import React, { PropTypes } from 'react';

import Text from './Text';
import Choice from './Choice';
import ScoreGroup from './ScoreGroup';

export default class Response extends React.Component {
  render() {
    return (
      <div>
        <h1>Response</h1>
        {this.props.questions.map(this._renderResponse)}
      </div>
    );
  }

  _renderResponse = (question, index) => {
    if (question.text) {
      return this._renderText(question, index);
    } else if (question.choice) {
      return this._renderChoice(question, index);
    }
    return this._renderScoreGroup(question, index);
  }

  _renderText(question, index) {
    let response = this.props.responses[index];
    return (
      <Text
              key={question.question}
              number={index + 1}
              question={question.question}
              isRequired={question.isRequired}
              response={response}
      />
    );
  }

  _renderChoice(question, index) {
    let response = this.props.responses[index];
    return (
      <Choice
              key={question.question}
              number={index + 1}
              question={question.question}
              isRequired={question.isRequired}
              isMultiple={question.choice.isMultiple}
              options={question.choice.options}
              response={response}
      />
    );
  }

  _renderScoreGroup(question, index) {
    let response = this.props.responses[index];
    return (
      <ScoreGroup
              key={question.question}
              number={index + 1}
              question={question.question}
              isRequired={question.isRequired}
              labels={question.scoregroup.labels.map(l => l.label)}
              items={question.scoregroup.items.map(i => i.text)}
              response={response}
      />
    );
  }
}
