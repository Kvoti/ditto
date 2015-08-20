import React, { PropTypes } from 'react';

export default class AddButton extends React.Component {
  render() {
    return (
      <button
	      className="btn btn-success"
	      {...this.props}
	      >
        Add
      </button>
    );
  }
}
