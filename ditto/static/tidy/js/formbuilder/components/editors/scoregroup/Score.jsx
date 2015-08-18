import React from 'react';

export default class Score extends React.Component {
  render() {
    let { score, ...props } = this.props;
    return (
      <input
	      size="5"
	      style={{textAlign: 'center'}}		 
	      value={score.get()}
	      onChange={(e) => score.set(e.target.value)}
	      {...props}
      />
    );
  }
}
