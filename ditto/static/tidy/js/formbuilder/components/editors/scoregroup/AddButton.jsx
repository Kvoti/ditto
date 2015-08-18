import React from 'react';

export default class AddButton extends React.Component {
  render() {
    let { children, ...props } = this.props;
    return (
      <button
              {...props}
              >
        {children}
      </button>
    );
  }
}
