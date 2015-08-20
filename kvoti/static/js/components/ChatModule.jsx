// TODO this is **very** similar to MessageSection, Could prob refactor both
var MessageListItem = require('../../flux-chat/js/components/MessageListItem.react');
var MessageStore = require('../../flux-chat/js/stores/MessageStore');
var FluidHeightMixin = require('../mixins/FluidHeightMixin.jsx');
var React = require('react');

function getStateFromStores() {
    return {
	// TODO this is a bit of a hack relying on the current thread defaulting to
	// the main site chatroom
        messages: MessageStore.getAllForCurrentThread()
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

var ChatModule = React.createClass({

    mixins: [FluidHeightMixin],
    
    getInitialState: function() {
        return getStateFromStores();
    },

    componentDidMount: function() {
        this._scrollToBottom();
        MessageStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        MessageStore.removeChangeListener(this._onChange);
    },

    render: function() {
	var style;
        var messageListItems = this.state.messages.map(getMessageListItem);
	// TODO can we move the height stuff here to a mixin somehow?
	if (this.props.fluidHeight) {
	    style = {height: this.state.height};
	}
        if (!this.state.messages.length) {
            return (
                <div style={style} ref="messageList">
		    <p>Loading ...</p>
		</div>
            );
        } else {
            return (
		<div className="message-section">
		    <ul style={style} className="message-list" ref="messageList">
			{messageListItems}
		    </ul>
		</div>
            );
	}
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

module.exports = ChatModule;
