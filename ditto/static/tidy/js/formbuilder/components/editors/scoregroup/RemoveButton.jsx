import React from 'react';

export default class RemoveButton extends React.Component {
  render() {
    let { children, ...props } = this.props;
    return (
      <button
              className="btn btn-danger"
              ariaLabel={children}
              {...props}
              >
        <span className="glyphicon glyphicon-remove-sign" ariaHidden="true"></span>
        {children}
      </button>
    );
  }
}
