import React from 'react';
import Text from './viewers/Text';
import Choice from './viewers/Choice';
import ScoreGroup from './viewers/ScoreGroup';
import Editor from './editors/Editor';

export default class Question extends React.Component {
  static propTypes = {
    isEditable: React.PropTypes.bool
  }

  render() {
    const { text, choice, scoregroup } = this.props;
    const { isEditable, ...subProps } = this.props;
    let component = Text;
    if (this.props.isEditable) {
      component = Editor;
    } else if (text) {
      component = Text;
    } else if (choice) {
      component = Choice;
    } else if (scoregroup) {
      component = ScoreGroup;
    }
    return React.createElement(component, subProps);
  }
}
