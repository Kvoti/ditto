var React = require('react/addons');
var RoleAndUserSelect = require('./RoleAndUserSelect.jsx');
var utils = require('../utils');
var RoomStore = require('../stores/RoomStore');
var SettingsActionCreators = require('../actions/SettingsActionCreators');
var _ = require('lodash');
var assign = require('object-assign');
var Alert = require('react-bootstrap/lib/Alert');
var Button = require('react-bootstrap/lib/Button');
var DateTimeRange = require('./DateTimeRange.jsx');

function getStateFromStores (room) {
    var initial = RoomStore.get(room);
    var current = assign({}, initial);
    return {
	initial: initial,
	current: current
    }
}

var OneOffChatroomSchedule = React.createClass({

    getInitialState () {
	return getStateFromStores(this.props.room);
    },
    
    componentDidMount () {
        RoomStore.addChangeListener(this._onChange);
    },

    componentWillUnmount () {
        RoomStore.removeChangeListener(this._onChange);
    },
    
    _onChange () {
        this.setState(getStateFromStores(this.props.room));
    },

    componentWillUpdate (nextProps, nextState) {
	if (this.state.pendingSince && !nextState.initial.isPending) {
	    let elapsed = new Date() - this.state.pendingSince;
	    let cancelInterval = Math.max(0, 500 - elapsed);
	    setTimeout(() => this.setState({pendingSince: null}), cancelInterval);
	}
    },
    
    render () {
	// Note we only need these IDs as using bootstrap and styling doesn't
	// work for inline forms if we nest the input in the label.
	// TODO requesting new ID on every render is wrong, use componentWillMount instead?
	var startID = utils.uniqueID();
	var endID = utils.uniqueID();
	// -----------------------------------
	if (this.state.current.failed) {
	    return (
		<div>
		    <Alert bsStyle='danger' onDismiss={this.handleAlertDismiss}>
			<h4>Error saving changes!</h4>
			<p>There was a server error trying to save your changes. Close this to revert your changes and try again.</p>
			<p>If the problem persists ...</p>
			<p>
			    <Button bsStyle="danger" onClick={this._revert}>Revert changes</Button>
			</p>
		    </Alert>
 		</div>
	    );
	}
	return (
	    <div>
		<DateTimeRange
			min={new Date()}
			start={this.state.current.start}
			end={this.state.current.end}
			onChange={this._updateDateTimeRange}
			/>
		<p>You can make this a private room by selecting roles and users below.</p>
		<RoleAndUserSelect
			selectedRoles={this.state.current.roles}
			users={this.state.current.users}
			onChangeRoles={this._update.bind(this, 'roles')}
			onChangeUsers={this._update.bind(this, 'users')}
			/>
	    <button disabled={this.state.pendingSince || !this._isChanged() || !this._isValid()} className="btn btn-success" onClick={this._save}>
		{this.state.pendingSince ? 'Saving...' : 'Save'}
	    </button>
	    {this._isChanged() ? <button className="btn btn-default" onClick={this._cancel}>Cancel</button> : null }
	    </div>
	);
    },

    _isChanged () {
	// TODO urgh, use immutable data here and make this easier!
	return !_.isEqual(this.state.current, this.state.initial);
    },

    _isValid () {
	// Require both start and end time
	// TODO want to validate that end is at least an hour after start
	// Not sure how to handle this as DateTimeRange does validation
	// but doesn't communicate that to this component. Maybe it could pass
	// back errors along with the new start and end values?
	// Or maybe DateTimeRange should be totally dumb and all validation
	// and interaction of start/end times handled by this component?
	// But can imagine a useful re-usable DateTimeRange that handles common
	// cases like requiring start and end times and end > start ...
	return this.state.current.start && this.state.current.end;
    },

    _update (key, value) {
	var current = this.state.current;
	current[key] = value;
	this.setState({current: current});
    },
    
    _updateDateTimeRange (start, end) {
	console.log('setting', start, end);
	var current = this.state.current;
	current.start = start;
	current.end = end;
	this.setState({current: current});
    },

    _cancel () {
	var current = assign({}, this.state.initial);
	this.setState({current: current});
    },

    _revert () {
	SettingsActionCreators.revertChatroom(this.props.room);
	this._cancel();
    },

    _save () {
	SettingsActionCreators.updateChatroom(this.props.room, {
	    start: this.state.current.start,
	    end: this.state.current.end,
	    users: this.state.current.users,
	    roles: this.state.current.roles,
	});
	this.setState({
	    pendingSince: new Date()
	});
    }
    
});

module.exports = OneOffChatroomSchedule;
