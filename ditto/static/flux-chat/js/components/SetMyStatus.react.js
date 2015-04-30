var React = require('react/addons');
var ChatConstants = require('../constants/ChatConstants');
var ChatWebAPIUtils = require('../utils/ChatWebAPIUtils');

var SetMyStatus = React.createClass({
    getInitialState: function() {
	return {
            prevStatus: {
                status: '',
                message: ''
            },
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
        ChatWebAPIUtils.setStatus(code, message);  // TODO show some sign of progress here until ack received?
        // TODO create an action here?
        this.setState({prevStatus: {status: code, message: message}});
    },
    render: function () {
	var options = [];
        var isChanged = this._isChanged();
        var submitClasses = React.addons.classSet({
            'form-control': true,
            'btn': true,
            'col-md-6': true,
            'btn-success': isChanged,
            'btn-disabled': !isChanged
        });
        for (var code in ChatConstants.chatStatus) {
	    options.push(<option value={code} key={code}>{ChatConstants.chatStatus[code]}</option>);
	}
	return (
	        <form className="form-horizontal" onSubmit={this.handleStatusChange}>
                <div className="form-group">
		<div className="col-md-6">
		    <input className="form-control" value={this.state.message} onChange={this.handleMessageChange} type="text" placeholder="Custom status..." ref="message" />
		</div>
		<div className="col-md-6">
		<select value={this.state.status} onChange={this._updateStatus} className="form-control" ref="status">
			<option value="">Online</option>
			{options}
		    </select>
		</div>
		</div>
                <div className="form-group">
                <div className="col-md-6">
		<input disabled={!this._isChanged()} className={submitClasses} type="submit" value="Set status" />
                </div>
                </div>
	        </form>
	);
    },
    _updateStatus: function (e) {
        this.setState({status: e.target.value});
    },
    _isChanged: function () {
        // TODO this will be easier when I adopt immutable-js
        return this.state.status !== this.state.prevStatus.status || this.state.message !== this.state.prevStatus.message;
    }
});

module.exports = SetMyStatus;
