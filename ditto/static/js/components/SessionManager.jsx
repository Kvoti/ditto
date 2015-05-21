var ChatThreadActionCreators = require('../../flux-chat/js/actions/ChatThreadActionCreators');
var React = require('react');
var UserAutocomplete = require('./UserAutocomplete.jsx');
var ThreadStore = require('../../flux-chat/js/stores/ThreadStore');
var Router = require('react-router');
var Navigation = Router.Navigation;

function getStateFromStores() {
    return {
        currentID: ThreadStore.getCurrentSessionID(),
        threadType: ThreadStore.getThreadType(),
    };
}

var SessionCreator = React.createClass({
    mixins: [Navigation],
    
    componentDidMount: function() {
        ThreadStore.addChangeListener(this._onStoreChange);
    },

    componentWillUnmount: function() {
        ThreadStore.removeChangeListener(this._onStoreChange);
    },

    getInitialState: function() {
	var state = getStateFromStores();
	state.text = '';
	state.user = null;
	return state;
    },

    render: function() {
	if (!(this.state.threadType === 'session' && !this.state.currentID)) {
	    return null;
	}
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
	var participants, threadID;
	// TODO remove this hack that encodes the participants in the the session id
	participants = [DITTO.user, this.state.user];
	participants.sort();
	participants = participants.join(':');
	// TODO threads can have parents so maybe we should have two top level
	// threads, "messages" and "sessions" (and sort out generally mapping
	// that to a threadID, and then mapping that to the URL -- threads need
	// a big sort out (made incrementally hacky changes from FBs original
	// example, hence need to do big sort out)
	threadID = 'session:' + participants + ':' + text;
	console.log("creating thread", threadID);
        //ChatThreadActionCreators.createThread(threadID);
	this.transitionTo('sessions', {id: threadID});
        this.setState({
	    text: '',
	    user: null,
	});
    },

    _onStoreChange: function() {
        this.setState(getStateFromStores());
    },
    
});

module.exports = SessionCreator;
