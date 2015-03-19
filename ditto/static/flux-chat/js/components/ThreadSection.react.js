var React = require('react');
var MessageStore = require('../stores/MessageStore');
var ThreadListItem = require('../components/ThreadListItem.react');
var ThreadStore = require('../stores/ThreadStore');
var UnreadThreadStore = require('../stores/UnreadThreadStore');

function getStateFromStores() {
    return {
        threads: ThreadStore.getAllChrono(),
        currentThreadID: ThreadStore.getCurrentID(),
        unreadCount: UnreadThreadStore.getCount()
    };
}

function notifyUnreadThreads() {
    document.getElementById('new-message-beep').play();
}

var ThreadSection = React.createClass({

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
                <div className="thread-section">
                <div className="thread-count">
                {unread}
            </div>
                <ul className="thread-list">
                {threadListItems}
            </ul>
                </div>
        );
    },

    /**
     * Event handler for 'change' events coming from the stores
     */
    _onChange: function() {
        this.setState(getStateFromStores());
    }

});

module.exports = ThreadSection;
