import React from 'react';

export default class Col extends React.Component {
  render() {
    return (
      <div
              style={{
                     display: 'inline-block',
                     width: 150,
                     textAlign: this.props.centered ? 'center' : 'left',
                     padding: 5
                     }}
              >
        {this.props.children}
      </div>
    );
  }
}
