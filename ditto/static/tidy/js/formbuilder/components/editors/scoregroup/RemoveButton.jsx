import React from 'react';

export default class RemoveButton extends React.Component {
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
