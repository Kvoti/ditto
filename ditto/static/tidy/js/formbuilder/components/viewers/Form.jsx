import React from 'react';
import Question from './Text';

export default class Form extends React.Component {
  render() {
    return (
      <div>
        <h1>{this.props.title}</h1>
        {this.props.questions.map(q => <Question {...q}/>)}
      </div>
    );
  }
}
