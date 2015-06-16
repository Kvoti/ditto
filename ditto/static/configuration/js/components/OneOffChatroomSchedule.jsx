var React = require('react/addons');
var RoleAndUserSelect = require('./RoleAndUserSelect.jsx');
var utils = require('../utils');
var RoomStore = require('../stores/RoomStore');
var SettingsActionCreators = require('../actions/SettingsActionCreators');
var _ = require('lodash'); // TODO only needed until switch to immutable data and can compare by ref
var assign = require('object-assign');
var Alert = require('react-bootstrap/lib/Alert');
var Button = require('react-bootstrap/lib/Button');

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
	// Not we only need these IDs as using bootstrap and styling doesn't
	// work for inline forms if we nest the input in the label
	// TODO requesting new ID on every render is wrong, use componentWillMount instead?
	var startID = utils.uniqueID();
	var endID = utils.uniqueID();

	// TODO remove these hacks
	// datetimes stored in UTC and serialized, by default, in UTC
	// Here we should display in local timezone so need to change serializer
	// to take account of current timezone when serializing/deserializing
	var start = this.state.current.start;
	if (start) {
	    start = start.replace('Z', '');
	}
	var end = this.state.current.end;
	if (end) {
	    end = end.replace('Z', '');
	}
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
		<div className="form-inline">
		    <div className="form-group">
			<label htmlFor={startID}>Start</label>
			<input id={startID} type="datetime-local" value={start} onChange={this._updateDateTime.bind(this, 'start')}/>
		    </div>
		    <div className="form-group">
			<label htmlFor={endID}>End</label>
			<input id={endID} type="datetime-local"  value={end} onChange={this._updateDateTime.bind(this, 'end')}/>
		    </div>
		</div>
		<p>You can make this a private room by selecting roles and users below.</p>
		<RoleAndUserSelect
			selectedRoles={this.state.current.roles}
			users={this.state.current.users}
			onChangeRoles={this._update.bind(this, 'roles')}
			onChangeUsers={this._update.bind(this, 'users')}
			/>
	    <button disabled={this.state.pendingSince || !this._isChanged()} className="btn btn-success" onClick={this._save}>
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
    
    _update (key, value) {
	var current = this.state.current;
	current[key] = value;
	this.setState({current: current});
    },
    
    _updateDateTime (key, e) {
	var value = e.target.value;
	var current = this.state.current;
	current[key] = value;
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
