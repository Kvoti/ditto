var React = require('react');
var ChatConstants = require('../constants/ChatConstants');
var ChatWebAPIUtils = require('../utils/ChatWebAPIUtils');

var SetMyStatus = React.createClass({
    getInitialState: function() {
	return {
	    status: '',
	    message: '',
	};
    },
    handleMessageChange: function(event) {
	this.setState({message: event.target.value});
    },
    handleStatusChange: function (e) {
	e.preventDefault();
	var message = this.refs.message.getDOMNode().value.trim();
	var code = this.refs.status.getDOMNode().value;
        ChatWebAPIUtils.setStatus(code, message);
        // TODO create an action here?
    },
    render: function () {
	var options = [];
	for (var code in ChatConstants.chatStatus) {
	    options.push(<option value={code} key={code}>{ChatConstants.chatStatus[code]}</option>);
	}
	return (
	    <form onSubmit={this.handleStatusChange}>
		<div className="col-md-2">
		    <input className="form-control" value={this.state.message} onChange={this.handleMessageChange} type="text" placeholder="Type your custom status message here..." ref="message" />
		</div>
		<div className="col-md-2">
		    <select className="form-control" ref="status">
			<option value="">Online</option>
			{options}
		    </select>
		</div>
		<div className="col-md-1">
		    <input className="form-control btn btn-success" type="submit" value="Set status" />
		</div>
	    </form>
	);
    }
});

module.exports = SetMyStatus;
