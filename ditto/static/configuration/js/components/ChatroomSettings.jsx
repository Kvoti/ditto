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
	    newChatroomID: ""
	}
    },
    
    componentDidMount () {
	API.loadChatrooms();
	API.loadSlots();
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
		<p>
		    <input type="text" valueLink={this.linkState('newChatroomID')} placeholder="Enter id" />
		    <button disabled={!this.state.newChatroomID} onClick={this._addChatroom}>Add chatroom</button>
		</p>
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
	this.setState(update(this.state, {
	    chatrooms: {$splice: [[0, 0, {id: this.state.newChatroomID}]]},
	    newChatroomID: {$set: ""}
	}));
    }
    
});

module.exports = ChatroomSettings;
