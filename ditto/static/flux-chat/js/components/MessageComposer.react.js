var ChatMessageActionCreators = require('../actions/ChatMessageActionCreators');
var React = require('react');
var ChatConstants = require('../constants/ChatConstants');

var ENTER_KEY_CODE = 13;

var MessageComposer = React.createClass({

    propTypes: {
        threadID: React.PropTypes.string.isRequired
    },

    getInitialState: function() {
        return {text: ''};
    },

    componentDidMount: function () {
	this.composedMessageChangeAt = null;
    },

    componentWillUnmount: function() {
	if (this._timeout) {
	    clearTimeout(this._timeout);
	}
    },
    
    render: function() {
        return (
                <textarea
            className="message-composer"
            name="message"
            value={this.state.text}
            onChange={this._onChange}
            onKeyDown={this._onKeyDown}
                />
        );
    },

    _onChange: function(event, value) {
        ChatMessageActionCreators.startTyping(this.props.threadID);
	this.composedMessageChangeAt = new Date();
	this._timeout = setTimeout(this._checkImStillTyping, ChatConstants.stillTypingTimeout);
        this.setState({text: event.target.value});
    },

    _onKeyDown: function(event) {
        if (event.keyCode === ENTER_KEY_CODE) {
            event.preventDefault();
            var text = this.state.text.trim();
            if (text) {
	        this.composedMessageChangeAt = null;
                ChatMessageActionCreators.createMessage(text, this.props.threadID);
            }
            this.setState({text: ''});
        }
    },

    _checkImStillTyping: function () {
        if (this.composedMessageChangeAt) {
	    var now = new Date();
	    if (now - this.composedMessageChangeAt > ChatConstants.stillTypingTimeout) {
	        this.composedMessageChangeAt = null;
                ChatMessageActionCreators.stopTyping(this.props.threadID);
	    } else {
	        this._timeout = setTimeout(this._checkImStillTyping, ChatConstants.stillTypingTimeout);
	    }
        }
    }
    
});

module.exports = MessageComposer;
