var React = require('react/addons');
var update = React.addons.update;
var RegularChatroomSchedule = require('./RegularChatroomSchedule.jsx');
var ChatHours = require('./ChatHours.jsx');
var RoleAndUserSelect = require('./RoleAndUserSelect.jsx');
var Constants = require('../constants/SettingsConstants');
var utils = require('../utils');
var assign = require('object-assign');
var RoomStore = require('../stores/RoomStore');
var SettingsActionCreators = require('../actions/SettingsActionCreators');

function getStateFromStores (room) {
    return RoomStore.get(room);
}

var OneOffChatroomSchedule = React.createClass({

    getInitialState () {
	return {
	    room: getStateFromStores(this.props.room),
	}
    },
    
    componentDidMount () {
        RoomStore.addChangeListener(this._onChange);
    },

    componentWillUnmount () {
        RoomStore.removeChangeListener(this._onChange);
    },
    
    _onChange () {
	var room = getStateFromStores(this.props.room);
        this.setState({room: room});
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
	var start = this.state.start || this.state.room.start;
	if (start) {
	    start = start.replace('Z', '');
	}
	var end = this.state.end || this.state.room.end;
	if (end) {
	    end = end.replace('Z', '');
	}
	// -----------------------------------
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
			selectedRoles={this.state.roles || this.state.room.roles}
			users={this.state.users || this.state.room.users}
			onChangeRoles={this._update.bind(this, 'roles')}
			onChangeUsers={this._update.bind(this, 'users')}
			/>
	    <button disabled={this.state.room.isPending} className="btn btn-success" onClick={this._save}>
		{this.state.room.isPending ? 'Saving...' : 'Save'}
	    </button>
		<button className="btn btn-default" onClick={this._cancel}>Cancel</button>
	    </div>
	);
    },

    _update (key, value) {
	var change = {};
	change[key] = value;
	this.setState(change);
    },
    
    _updateDateTime (key, e) {
	var value = e.target.value;
	var change = {};
	change[key] = value;
	this.setState(change);
    },

    _cancel () {
	this.setState({
	    start: null,
	    end: null,
	    users: null,
	    roles: null
	});
    },

    _save () {
	SettingsActionCreators.updateChatroom(this.props.room, {
	    start: this.state.start || this.state.room.start,
	    end: this.state.end || this.state.room.end,
	    // TODO allow partial updates so we only specify fields that have changed?
	    users: this.state.users || this.state.room.users,
	    roles: this.state.roles || this.state.room.roles
	});
	this.setState({
	    start: null,
	    end: null,
	    users: null,
	    roles: null
	});
    }
    
});

module.exports = OneOffChatroomSchedule;
