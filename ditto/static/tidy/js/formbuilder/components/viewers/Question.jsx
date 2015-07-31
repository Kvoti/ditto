import React from 'react';
import Text from './Text';
import Choice from './Choice';
import ScoreGroup from './ScoreGroup';

export default class Question extends React.Component {
  render() {
    const { text, choice, scoreGroup } = this.props;
    let component;
    if (text) {
      component = Text;
    } else if (choice) {
      component = Choice;
    } else if (scoreGroup) {
      component = ScoreGroup;
    }
    return React.createElement(component, this.props);
  }
}
