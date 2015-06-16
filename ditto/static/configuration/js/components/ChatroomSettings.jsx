var React = require('react/addons');
var update = React.addons.update;
var CheckList = require('./CheckList.jsx');
var RegularChatroomSchedule = require('./RegularChatroomSchedule.jsx');
var OneOffChatroomSchedule = require('./OneOffChatroomSchedule.jsx');
var RoleAndUserSelect = require('./RoleAndUserSelect.jsx');
var Accordion = require('react-bootstrap/lib/Accordion');
var Panel = require('react-bootstrap/lib/Panel');
var API = require('../utils/SettingsWebAPIUtils');
var RoomStore = require('../stores/RoomStore');
var Alert = require('react-bootstrap/lib/Alert');
var SettingsActionCreators = require('../actions/SettingsActionCreators');

function getStateFromStores () {
    return RoomStore.getAll();
}

var ChatroomSettings = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    
    getInitialState () {
	return {
	    creatorRoles: [],
	    creatorUsers: [],
	    chatrooms: getStateFromStores(),
	    newChatroomID: "",
	    newChatroomName: "",
	    newChatroomFormErrors: []
	}
    },
    
    componentDidMount () {
	API.loadChatrooms();
	API.loadSlots();
	API.loadRoles();
        RoomStore.addChangeListener(this._onChange);
    },

    componentWillUnmount () {
        RoomStore.removeChangeListener(this._onChange);
    },
    
    _onChange () {
        this.setState(update(this.state,
	    {chatrooms: {$set: getStateFromStores()}}));
    },
    
    render () {
	return (
	    <div>
		<p>Select which roles and users can create chatrooms.</p>
		<RoleAndUserSelect
			roles={['Admin', 'Member', 'Counsellor']}
			selectedRoles={this.state.creatorRoles}
			users={this.state.creatorUsers}
			onChangeRoles={this._updateRoles}
			onChangeUsers={this._updateUsers}
			/>
		<hr/>
		<h3>Configure chatrooms</h3>
		{this.state.newChatroomFormErrors.map(e => <Alert bsStyle="danger">{e}</Alert>)}
	    <div className="form-inline">
		<div className="form-group">
		    <label>
			<input className="form-control" type="checkbox" checkedLink={this.linkState('isNewChatroomRegular')} />
			Regular scheduled room?
		    </label>
		</div>
		<div className="form-group">
		    <input className="form-control" type="text" valueLink={this.linkState('newChatroomID')} placeholder="Enter id (a-z characters only)" />
		</div>
		<div className="form-group">
		    <input className="form-control" type="text" valueLink={this.linkState('newChatroomName')} placeholder="Enter name" />
		</div>
		<div className="form-group">
		    <button className="btn btn-success" onClick={this._addChatroom}>Add chatroom</button>
		</div>
	    </div>
		<Accordion defaultActiveKey={this.state.chatrooms.length && this.state.chatrooms[0].slug}>
		    {this.state.chatrooms.map(room => {
			return (
			    <Panel eventKey={room.slug} header={room.name}>
				{room.is_regular ?
				 <RegularChatroomSchedule room={room.slug} /> :
				 <OneOffChatroomSchedule room={room.slug} />}
			    </Panel>
			);
		    })}
		</Accordion>
	    </div>
	);
    },

    _updateRoles (roles) {
	this.setState({creatorRoles: roles});
    },

    _updateUsers (users) {
	this.setState({creatorUsers: users});
    },

    _addChatroom () {
	var errors = this._validateNewChatroom();
	if (errors.length) {
	    this.setState({newChatroomFormErrors: errors});
	} else {
	    SettingsActionCreators.createChatroom({
		is_regular: this.state.isNewChatroomRegular,
		slug: this.state.newChatroomID,
		name: this.state.newChatroomName
	    })
	    this.setState({
		newChatroomName: "",
		newChatroomID: "",
		newChatroomFormErrors: [],
		isNewChatroomRegular: false,
	    });
	}
    },

    _validateNewChatroom () {
	var errors = [];
	if (this.state.newChatroomID && !/^[a-z]+$/.test(this.state.newChatroomID)) {
	    errors.push('Please only use lowecase letters for the ID');
	}
	if (!this.state.newChatroomID && this.state.newChatroomName ||
	    !this.state.newChatroomName && this.state.newChatroomID) {
		errors.push('Please provide an ID and a name');
	}
	console.log(this.state.chatrooms);
	if (this.state.chatrooms.findIndex(c => c.slug === this.state.newChatroomID) > -1) {
	    errors.push('Room with id ' + this.state.newChatroomID + ' already exists');
	}
	return errors;
    },
    
});

module.exports = ChatroomSettings;
