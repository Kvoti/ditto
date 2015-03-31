var ChatThreadActionCreators = require('../../flux-chat/js/actions/ChatThreadActionCreators');
var React = require('react');

var ThreadCreator = React.createClass({

    getInitialState: function() {
        return {text: ''};
    },

    render: function() {
        return (
	    <form onSubmit={this._onSubmit}>
            <input
		    name="message"
		    value={this.state.text}
		    onChange={this._onChange}
		    />
	    <input type="submit" value="Create thread" />
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
