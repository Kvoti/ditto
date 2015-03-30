// TODO this is very similar to MessageSection, just with a fixed threadID. Could prob refactor both
var MessageListItem = require('../../flux-chat/js/components/MessageListItem.react');
var MessageStore = require('../../flux-chat/js/stores/MessageStore');
var React = require('react');

function getStateFromStores() {
    return {
        messages: MessageStore.getAllForThread(Strophe.getNodeFromJid(chatConf.chatroom)),
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

    getInitialState: function() {
        return getStateFromStores();
    },

    componentWillMount: function () {
	this._updateHeight();
    },
    
    componentDidMount: function() {
        this._scrollToBottom();
        MessageStore.addChangeListener(this._onChange);
	$(window).on('resize', this._updateHeight);
    },

    componentWillUnmount: function() {
        MessageStore.removeChangeListener(this._onChange);
	$(window).off('resize', this._updateHeight);
    },

    render: function() {
	var style;
        var messageListItems = this.state.messages.map(getMessageListItem);
        if (!this.state.messages.length) {
            return (
                    <div ref="messageList">Loading ...</div>
            );
        }
	if (this.props.fluidHeight) {
	    style = {height: this.state.height};
	}
        return (
            <div className="message-section">
		<ul style={style} className="message-list" ref="messageList">
		    {messageListItems}
		</ul>
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
    
    _updateHeight: function () {
	// TODO no pure css way to do this?
	// Note, tried to calculate the height from other dom elements but it's easier just to hardcode this vaule and change it when the css changes
	var height = $(window).height() - 220;
	this.setState({height: height});
    },

    /**
     * Event handler for 'change' events coming from the MessageStore
     */
    _onChange: function() {
        this.setState(getStateFromStores());
    }

});

module.exports = ChatModule;
