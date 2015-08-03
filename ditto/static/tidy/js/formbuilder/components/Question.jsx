import React from 'react';
import Text from './viewers/Text';
import Choice from './viewers/Choice';
import ScoreGroup from './viewers/ScoreGroup';
// TODO neater to have Text.Editor and Text.Viewer?
import TextEditor from './editors/Text';

export default class Question extends React.Component {
  static propTypes = {
    isEditable: React.PropTypes.bool
  }
  
  render() {
    console.log('isEditable', this.props.isEditable);
    const { text, choice, scoregroup } = this.props;
    let component = Text;
    if (text) {
      component = this.props.isEditable ? TextEditor : Text;
    } else if (choice) {
      component = Choice;
    } else if (scoregroup) {
      component = ScoreGroup;
    }
    return React.createElement(component, this.props);
  }
}
