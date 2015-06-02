var React = require('react');
var MessageStore = require('../stores/MessageStore');
var ThreadListItem = require('../components/ThreadListItem.react');
var ThreadStore = require('../stores/ThreadStore');
var UnreadThreadStore = require('../stores/UnreadThreadStore');
var FluidHeightMixin = require('../../../js/mixins/FluidHeightMixin.jsx');
var ChatThreadActionCreators = require('../actions/ChatThreadActionCreators');
var Router = require('react-router');
var Link = Router.Link;

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

function notifyUnreadThreads() {
    document.getElementById('new-message-beep').play();
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
	var style = {height: this.state.height};
        var threadListItems = this.state.threads.map(function(thread) {
            return (
                    <ThreadListItem
                key={thread.id}
                thread={thread}
                currentThreadID={this.state.currentThreadID}
		threadType={this.state.threadType + "s"}
                    />
            );
        }, this);
        var unread =
            this.state.unreadCount === 0 ?
            null :
            <span>Unread threads: {this.state.unreadCount}</span>;
        if (this.state.unreadCount) {
            notifyUnreadThreads();
        }
        return (
                <div className="thread-section" style={style}>
                <ul className="nav nav-tabs">
                <li role="presentation" className={this.state.threadType === ThreadStore.message ? 'active' : ''}>
                {this.state.currentChatID ?
                 <Link to="messages" params={{id: this.state.currentChatID}}>My chats</Link> :
                 <Link to="messagesHome">My chats</Link>}
                 
                </li>
                <li role="presentation" className={this.state.threadType === ThreadStore.session ? 'active' : ''}>
                {this.state.currentSessionID ?
                 <Link to="sessions" params={{id: this.state.currentSessionID}}>My sessions</Link> :
                 <Link to="sessionsHome">My sessions</Link>}
                </li>
                 </ul>
                <div className="thread-count">
                {unread}
            </div>
                <div className="list-group">
                {threadListItems}
            </div>
		{this.state.currentSessionID ? <Link className="btn btn-primary" to="sessionsHome">New session</Link> : null }
		{this.state.currentChatID ? <Link className="btn btn-primary" to="messagesHome">New message</Link> : null }
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
