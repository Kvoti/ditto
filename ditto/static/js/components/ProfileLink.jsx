import React from 'react';

export default class ProfileLink extends React.Component {
  render() {
    let link = '/' + DITTO.tenant + '/users/' + this.props.username + '/';
    return (
      <a href={link}>
	{this.props.children}
      </a>
    );
  }
}
