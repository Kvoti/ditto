var React = require('react/addons');
var update = React.addons.update;
var RegularChatroomSchedule = require('./RegularChatroomSchedule.jsx');
var ChatHours = require('./ChatHours.jsx');
var RoleAndUserSelect = require('./RoleAndUserSelect.jsx');
var Constants = require('../constants/SettingsConstants');
var utils = require('../utils');
var assign = require('object-assign');

var OneOffChatroomSchedule = React.createClass({

    getInitialState () {
	return {
	    start: null,
	    end: null,
	    roles: [],
	    users: []
	};
    },
    
    render () {
	// Not we only need these IDs as using bootstrap and styling doesn't
	// work for inline forms if we nest the input in the label
	var dateID = utils.uniqueID();
	var startID = utils.uniqueID();
	var endID = utils.uniqueID();
	
	return (
	    <div>
		<div className="form-inline">
		    <div className="form-group">
			<label forHtml={dateID}>Date</label>
			<input id={dateID} type="date" />
		    </div>
		    <ChatHours onChange={this._update} start={this.state.start} end={this.state.end} />
		</div>
		<p>You can make this a private room by selecting roles and users below.</p>
		<RoleAndUserSelect
			roles={['Admin', 'Member', 'Counsellor']}
			selectedRoles={this.state.roles}
			users={this.state.users}
			onChangeRoles={this._update.bind(this, 'roles')}
			onChangeUsers={this._update.bind(this, 'users')}
			/>
	    </div>
	);
    },

    _update (key, value) {
	var change = {};
	change[key] = {$set: value};
	this.setState(update(this.state, change));
    }

});

module.exports = OneOffChatroomSchedule;
