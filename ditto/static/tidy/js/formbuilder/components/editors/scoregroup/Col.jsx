import React from 'react';

export default class Col extends React.Component {
  render() {
    return (
      <div
	      style={{
		     display: 'inline-block',
		     width: 200,
		     textAlign: this.props.centered ? 'center' : 'left'
		    
		     }}
	      >
	{this.props.children}
      </div>
    );
  }
}
