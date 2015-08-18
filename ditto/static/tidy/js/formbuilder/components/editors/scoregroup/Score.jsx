import React from 'react';
import Input from './Input';

export default class Score extends React.Component {
  render() {
    let { score, ...props } = this.props;
    return (
      <Input
	      errors={score.errors}
	      size="5"
	      style={{textAlign: 'center'}}		 
	      value={score.get()}
	      onChange={(e) => score.set(e.target.value)}
	      {...props}
      />
    );
  }
}
