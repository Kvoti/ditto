var ChatThreadActionCreators = require('../../flux-chat/js/actions/ChatThreadActionCreators');
var React = require('react');
var UserAutocomplete = require('./UserAutocomplete.jsx');
var SessionCreator = React.createClass({

    getInitialState: function() {
        return {
	    text: '',
	    user: null
	};
    },

    render: function() {
        return (
	    <form className="form-horizontal" onSubmit={this._onSubmit}>
		<div className="form-group">
		    <div className="col-md-3">
			<label>
			    User
			</label>
		    </div>
		    <div className="col-md-9">
			<UserAutocomplete onChange={this._onUserChange} />
		    </div>
		</div>
		<div className="form-group">
		    <div className="col-md-3">
			<label forHtml="id-message">
			    Session title
			</label>
		    </div>
		    <div className="col-md-9">
			<input
				id="id-message"
				className="form-control"
				name="message"
				value={this.state.text}
				onChange={this._onChange}
				/>
		    </div>
		</div>
		<input disabled={!this._isValid()} className="btn btn-success" type="submit" value="Create session" />
	    </form>
        );
    },

    _isValid: function () {
	return this.state.text && this.state.user;
    },

    _onChange: function(event, value) {
        this.setState({text: event.target.value});
    },

    _onUserChange: function (user) {
        this.setState({user: user});
    },
    
    _onSubmit: function(event) {
        event.preventDefault();
        var text = this.state.text.trim();
	var participants, session;
        if (text) {
	    // TODO remove this hack that encodes the participants in the the session id
	    participants = this.props.sessionID.split(':').slice(0, 2).join(':');
	    session = participants + ':' + text;
            ChatSessionActionCreators.createSession(session);
        }
        this.setState({text: ''});
    },

});

module.exports = SessionCreator;
