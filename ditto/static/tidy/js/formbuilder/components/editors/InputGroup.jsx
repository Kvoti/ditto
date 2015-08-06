import React from 'react';

export default class InputGroup extends React.Component {
  render() {
    let { children, ...passThroughProps } = this.props;
    let control = React.cloneElement(
      this.props.children[0],
      passThroughProps
    );
    return (
      <div className="input-group">
        {control}
        {children.slice(1)}
      </div>
    );
  }
}
