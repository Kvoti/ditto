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
var RoomCreatorStore = require('../stores/RoomCreatorStore');
var Alert = require('react-bootstrap/lib/Alert');
var SettingsActionCreators = require('../actions/SettingsActionCreators');
var assign = require('object-assign');

function getStateFromStores () {
    return {
	chatrooms: RoomStore.getAll(),
	creators: RoomCreatorStore.get()
    }
}

var ChatroomSettings = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    
    getInitialState () {
	return assign({
	    newChatroomID: "",
	    newChatroomName: "",
	    newChatroomFormErrors: []
	}, getStateFromStores());
    },
    
    componentDidMount () {
	// TODO api batching probably useful here
	API.loadChatrooms();
	API.loadSlots();
	API.loadRoles();
	API.loadCreators();
        RoomStore.addChangeListener(this._onChange);
        RoomCreatorStore.addChangeListener(this._onChange);
    },

    componentWillUnmount () {
        RoomCreatorStore.removeChangeListener(this._onChange);
    },
    
    _onChange () {
        this.setState(getStateFromStores());
    },
    
    render () {
	return (
	    <div>
		<p>Select which roles and users can create chatrooms.</p>
		<RoleAndUserSelect
			roles={['Admin', 'Member', 'Counsellor']}
			selectedRoles={this.state.creators.roles}
			users={this.state.creators.users}
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
	    {this.state.chatrooms.length ? 
		<Accordion defaultActiveKey={this.state.chatrooms[0].slug}>
		    {this.state.chatrooms.map(room => {
			return (
			    <Panel eventKey={room.slug} header={room.name}>
				{room.is_regular ?
				 <RegularChatroomSchedule room={room.slug} /> :
				    <OneOffChatroomSchedule room={room.slug} />}
			    <p>
			    <button
			    className="btn btn-danger"
			    disabled={room.isDeleting}
			    onClick={this._deleteChatroom.bind(this, room.slug)}>
			    {room.isDeleting ? 'Deleting ...' : 'Delete room'}
			    </button>
			    </p>
			    </Panel>
			);
		    })}
		</Accordion>
	     : null }
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

    _deleteChatroom (slug) {
	SettingsActionCreators.deleteChatroom(slug);
    }
});

module.exports = ChatroomSettings;
