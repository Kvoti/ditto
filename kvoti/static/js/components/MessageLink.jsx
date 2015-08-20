var React = require('react');
var ChatMessageUtils = require('../../flux-chat/js/utils/ChatMessageUtils');

var MessageLink = React.createClass({

    render: function () {
	var threadID = ChatMessageUtils.getPrivateChatThreadID(this.props.from, this.props.to);
	var messageLink = '/' + KVOTI.tenant + '/messages/' + threadID + '/';
	// TODO don't have a link if from === to (should the parent component decide handle this?)
	return (
	    <a href={messageLink}>
		{this.props.children}
	    </a>
	);
    }
});

module.exports = MessageLink;
