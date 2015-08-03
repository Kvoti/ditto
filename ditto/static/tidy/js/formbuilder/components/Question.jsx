import React from 'react';
import Text from './viewers/Text';
import Choice from './viewers/Choice';
import ScoreGroup from './viewers/ScoreGroup';
import QuestionEditor from './editors/Question';

export default class Question extends React.Component {
  static propTypes = {
    isEditable: React.PropTypes.bool
  }

  render() {
    const { text, choice, scoregroup } = this.props;
    let component = Text;
    if (this.props.isEditable) {
      component = QuestionEditor;
    } else if (text) {
      component = Text;
    } else if (choice) {
      component = Choice;
    } else if (scoregroup) {
      component = ScoreGroup;
    }
    return React.createElement(component, this.props);
  }
}
