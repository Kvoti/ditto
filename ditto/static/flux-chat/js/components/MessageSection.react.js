var MessageComposer = require('./MessageComposer.react');
var MessageListItem = require('./MessageListItem.react');
var WhosTyping = require('./WhosTyping.react');
var MessageStore = require('../stores/MessageStore');
var React = require('react');
var ThreadStore = require('../stores/ThreadStore');
var WhosTypingStore = require('../stores/WhosTypingStore');
var FluidHeightMixin = require('../../../js/mixins/FluidHeightMixin.jsx');

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

    getInitialState: function() {
        return getStateFromStores();
    },

    componentDidMount: function() {
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
	// TODO can we move the height stuff here to a mixin somehow?
	if (this.state.messages.length) {
	    style = {height: this.state.height};
	};	    
        return (
            <div className="message-section">
            <ul style={style} className="message-list" ref="messageList">
            {messageListItems}
            </ul>
                <WhosTyping users={this.state.whosTyping} />
                {this.state.thread ? <MessageComposer threadID={this.state.thread.id} isGroup={this.props.isGroup} /> : null }
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
