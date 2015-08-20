import React from 'react';

export default class Col extends React.Component {
  render() {
    let { style = {}, ...props } = this.props;
    style = {
      display: 'inline-block',
      textAlign: this.props.centered ? 'center' : 'left',
      padding: 5,
      ...style
    };
    return (
      <div style={style}>
        {this.props.children}
      </div>
    );
  }
}
