var React = require('react');
var MessageStore = require('../stores/MessageStore');
var ThreadListItem = require('../components/ThreadListItem.react');
var ThreadStore = require('../stores/ThreadStore');
var UnreadThreadStore = require('../stores/UnreadThreadStore');
var FluidHeightMixin = require('../../../js/mixins/FluidHeightMixin.jsx');
var ChatThreadActionCreators = require('../actions/ChatThreadActionCreators');

function getStateFromStores() {
    return {
        threads: ThreadStore.getAllChrono(),
        currentThreadID: ThreadStore.getCurrentID(),
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
                <li role="presentation" className={this.state.threadType === ThreadStore.message ? 'active' : ''}><a onClick={this._toggleChats} href="#">My chats</a></li>
                <li role="presentation" className={this.state.threadType === ThreadStore.session ? 'active' : ''}><a onClick={this._toggleChats} href="#">My sessions</a></li>
                </ul>
                <div className="thread-count">
                {unread}
            </div>
                <div className="list-group">
                {threadListItems}
            </div>
                </div>
        );
    },

    /**
     * Event handler for 'change' events coming from the stores
     */
    _onChange: function() {
        this.setState(getStateFromStores());
    },

    _toggleChats: function () {
        ChatThreadActionCreators.toggleChatType();
    }
    
});

module.exports = ThreadSection;
