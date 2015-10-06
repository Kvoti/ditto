import React from 'react';

import UnreadThreadStore from '../stores/UnreadThreadStore';

function getStateFromStores() {
  return {
    unreadCount: UnreadThreadStore.getCount()
  };
}

export default class NewMessageCount extends React.Component {
  state = getStateFromStores()

  componentDidMount() {
    UnreadThreadStore.addChangeListener(this._onChange);
  }

  componentWillUnmount() {
    UnreadThreadStore.removeChangeListener(this._onChange);
  }

  render() {
    console.log('XXXshowing unread', this.state.unreadCount);
    if (this.state.unreadCount) {
      return <span className="badge"><b>{this.state.unreadCount}</b></span>;
    }
    return null;
  }

  _onChange = () => {
    this.setState(getStateFromStores());
  }
}
