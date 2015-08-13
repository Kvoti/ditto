import React from 'react';

export default class InputGroup extends React.Component {
  static defaultProps = {
    hasAddon: false
  }
  
  render() {
    let { children, hasAddon, ...passThroughProps } = this.props;
    let control = React.cloneElement(
      this.props.children[0],
      passThroughProps
    );
    return (
      <div className={hasAddon ? 'input-group' : ''}>
        {control}
        {children.slice(1)}
      </div>
    );
  }
}
