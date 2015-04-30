var ChatThreadActionCreators = require('../../flux-chat/js/actions/ChatThreadActionCreators');
var React = require('react');

var ThreadCreator = React.createClass({

    getInitialState: function() {
        return {text: ''};
    },

    render: function() {
        return (
	    <form className="form-horizontal" onSubmit={this._onSubmit}>
		<div className="form-group">
		    <div className="col-md-10">
			<input
				className="form-control"
				name="message"
				value={this.state.text}
				onChange={this._onChange}
				/>
			</div>
			<div className="col-md-2">
			    <input className="btn btn-success" type="submit" value="Create thread" />
			</div>
		</div>
	    </form>
        );
    },

    _onChange: function(event, value) {
        this.setState({text: event.target.value});
    },

    _onSubmit: function(event) {
        event.preventDefault();
        var text = this.state.text.trim();
	var participants, thread;
        if (text) {
	    // TODO remove this hack that encodes the participants in the the thread id
	    participants = this.props.threadID.split(':').slice(0, 2).join(':');
	    thread = participants + ':' + text;
            ChatThreadActionCreators.createThread(thread);
        }
        this.setState({text: ''});
    },

});

module.exports = ThreadCreator;
