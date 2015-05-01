var MessageComposer = require('./MessageComposer.react');
var MessageListItem = require('./MessageListItem.react');
var WhosTyping = require('./WhosTyping.react');
var MessageStore = require('../stores/MessageStore');
var React = require('react');
var ThreadStore = require('../stores/ThreadStore');
var WhosTypingStore = require('../stores/WhosTypingStore');
var FluidHeightMixin = require('../../../js/mixins/FluidHeightMixin.jsx');
var ThreadCreator = require('../../../js/components/ThreadCreator.jsx');

function getStateFromStores() {
    return {
        messages: MessageStore.getAllForCurrentThread(),
        thread: ThreadStore.getCurrent(),
        whosTyping: WhosTypingStore.getForCurrentThread()
    };
}

function getMessageListItem(message) {
    return (
        <MessageListItem
        key={message.id}
        message={message}
        />
    );
}

var MessageSection = React.createClass({
    mixins: [FluidHeightMixin],

    getDefaultProps: function () {
        return {
            withThreadCreator: true
        }
    },
    
    getInitialState: function() {
        return getStateFromStores();
    },

    componentDidMount: function() {
        this._scrollToBottom();
        MessageStore.addChangeListener(this._onChange);
        ThreadStore.addChangeListener(this._onChange);
        WhosTypingStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        MessageStore.removeChangeListener(this._onChange);
        ThreadStore.removeChangeListener(this._onChange);
        WhosTypingStore.removeChangeListener(this._onChange);
    },

    render: function() {
        var style;
        var messageListItems = this.state.messages.map(getMessageListItem);
        if (!this.state.thread) {
            return (
                    <div ref="messageList">Loading ...</div>
            );
        }
	// TODO can we move the height stuff here to a mixin somehow?
	style = {height: this.state.height};
        return (
            <div className="message-section">
            <ul style={style} className="message-list" ref="messageList">
            {messageListItems}
            </ul>
                <WhosTyping users={this.state.whosTyping} />
                <MessageComposer threadID={this.state.thread.id} isGroup={this.props.isGroup} />
                {!this.props.isGroup ? <ThreadCreator threadID={this.state.thread.id}/> : null}
                </div>
        );
    },

    componentDidUpdate: function() {
        this._scrollToBottom();
    },

    _scrollToBottom: function() {
        var ul = this.refs.messageList.getDOMNode();
        ul.scrollTop = ul.scrollHeight;
    },

    /**
     * Event handler for 'change' events coming from the MessageStore
     */
    _onChange: function() {
        this.setState(getStateFromStores());
    }

});

module.exports = MessageSection;
