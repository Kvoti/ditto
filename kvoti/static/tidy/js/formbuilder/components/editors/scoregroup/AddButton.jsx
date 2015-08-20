import React from 'react';

export default class AddButton extends React.Component {
  render() {
    let { children, ...props } = this.props;
    return (
      <button
              className="btn btn-success"
              ariaLabel={children}
              {...props}
              >
        <span className="glyphicon glyphicon-plus-sign" ariaHidden="true"></span>
        {children}
      </button>
    );
  }
}
