import React from 'react';

export default class Input extends React.Component {
  render() {
    let { errors, style, ...props } = this.props;
    if (style === undefined) {
      style = {};
    } else {
      style = {...style};
    }
    style.borderStyle = 'solid';
    if (errors !== null) {
      if (errors.length) {
        style.borderColor = 'red';
      } else {
        style.borderColor = 'green';
      }
    }
    return (
      <input
              style={style}
              {...props}
      />
    );
  }
}
