var React = require('react');
var MessageStore = require('../stores/MessageStore');
var ThreadListItem = require('../components/ThreadListItem.react');
var ThreadStore = require('../stores/ThreadStore');
var UnreadThreadStore = require('../stores/UnreadThreadStore');
var FluidHeightMixin = require('../../../js/mixins/FluidHeightMixin.jsx');
var ChatThreadActionCreators = require('../actions/ChatThreadActionCreators');
var urls = require('../utils/urlUtils');

import { Link } from 'react-router';

function getStateFromStores() {
    return {
        threads: ThreadStore.getAllChrono(),
        currentThreadID: ThreadStore.getCurrentID(),
        currentChatID: ThreadStore.getCurrentChatID(),
        currentSessionID: ThreadStore.getCurrentSessionID(),
        unreadCount: UnreadThreadStore.getCount(),
        threadType: ThreadStore.getThreadType(),
    };
}

var ThreadSection = React.createClass({
    mixins: [FluidHeightMixin],

    getInitialState: function() {
        return getStateFromStores();
    },

    componentDidMount: function() {
        ThreadStore.addChangeListener(this._onChange);
        UnreadThreadStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        ThreadStore.removeChangeListener(this._onChange);
        UnreadThreadStore.removeChangeListener(this._onChange);
    },

    render: function() {
      var style = {height: this.state.height, 'overflow-y': 'scroll'};
        var threadListItems = this.state.threads.map(function(thread) {
            return (
                    <ThreadListItem
                key={thread.id}
                thread={thread}
                currentThreadID={this.state.currentThreadID}
		threadType={this.state.threadType}
                    />
            );
        }, this);
        var unread =
            this.state.unreadCount === 0 ?
            null :
            <span>Unread threads: {this.state.unreadCount}</span>;
        return (
                <div className="thread-section">
                <ul className="nav nav-tabs">
                <li role="presentation" className={this.state.threadType === ThreadStore.message ? 'active' : ''}>
                {this.state.currentChatID ?
                 <Link to={urls.message(this.state.currentChatID)}>My chats</Link> :
                 <Link to={urls.messages()}>My chats</Link>}
                 
                </li>
                <li role="presentation" className={this.state.threadType === ThreadStore.session ? 'active' : ''}>
                {this.state.currentSessionID ?
                 <Link to={urls.session(this.state.currentSessionID)}>My sessions</Link> :
                 <Link to={urls.sessions()}>My sessions</Link>}
                </li>
                 </ul>
                <div className="thread-count">
                {unread}
            </div>
                <div className="list-group" style={style}>
                {threadListItems}
            </div>
		{this.state.threadType === ThreadStore.session && this.state.currentSessionID ? <Link className="btn btn-primary" to={urls.sessions()}>New session</Link> : null }
	    {this.state.threadType !== ThreadStore.session && this.state.currentChatID ? <Link className="btn btn-primary" to={urls.messages()}>New chat</Link> : null }
                </div>
        );
    },

    /**
     * Event handler for 'change' events coming from the stores
     */
    _onChange: function() {
        this.setState(getStateFromStores());
    },
    
});

module.exports = ThreadSection;
