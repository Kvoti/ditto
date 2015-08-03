import React from 'react';
import Text from './Text';
import Choice from './Choice';
import ScoreGroup from './ScoreGroup';

export default class Question extends React.Component {
  render() {
    const { text, choice, scoregroup } = this.props;
    let component = Text;
    if (text) {
      component = Text;
    } else if (choice) {
      component = Choice;
    } else if (scoregroup) {
      component = ScoreGroup;
    }
    return React.createElement(component, this.props);
  }
}
