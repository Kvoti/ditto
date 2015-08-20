var React = require('react');
var ChatConstants = require('../constants/ChatConstants');

var ShowStatus = React.createClass({
    propTypes: {
	code: React.PropTypes.oneOf([
	    'online',
            'away',
            'chat',
            'dnd',
            'xa',
	    'offline'
	]).isRequired,
	message: React.PropTypes.string,
    },

    render () {
	var style = {
	    width: 15,
	    height: 15,
	    borderRadius: '50%',
	    display: 'inline-block',
	};
	var statusText;
	if (this.props.code == 'offline') {
	    style.border = '1px solid grey';
	    statusText = 'Offline';
	} else if (this.props.code == 'online') {
	    style.backgroundColor = 'green';
	    statusText = 'Online';
	} else if (this.props.code == 'away' || this.props.code == 'xa') {
	    style.backgroundColor = 'yellow';
	} else {
	    style.backgroundColor = 'red';
	}
	statusText = statusText || ChatConstants.chatStatus[code];
	return (
	    <span>
		<i style={style}></i>
		<span className="sr-only">{statusText}</span>
		{this.props.message ? <em>{this.props.message}</em> : null}
	    </span>
	);
    }
});

module.exports = ShowStatus;
