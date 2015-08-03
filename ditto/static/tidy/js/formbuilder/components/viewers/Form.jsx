import React from 'react';
import Question from './Question';

export default class Form extends React.Component {
  render() {
    console.log(this.props);
    return (
      <div>
        <h1>{this.props.title}</h1>
        {this.props.questions.map(q => <Question key={q.id} {...q}/>)}
      </div>
    );
  }
}
