var React = require('react/addons');
var update = React.addons.update;
var CheckList = require('./CheckList.jsx');
var ChatroomSchedule = require('./ChatroomSchedule.jsx');
var RoleAndUserSelect = require('./RoleAndUserSelect.jsx');
var Accordion = require('react-bootstrap/lib/Accordion');
var Panel = require('react-bootstrap/lib/Panel');

var ChatroomSettings = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    
    getInitialState () {
	return {
	    creatorRoles: [],
	    creatorUsers: [],
	    chatrooms: [
		{id: 'main'},
		{id: 'surgery'}
	    ],
	    newChatroomID: ""
	}
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
		<Accordion defaultActiveKey={this.state.chatrooms[0].id}>
		    {this.state.chatrooms.map(room => {
			return (
			    <Panel eventKey={room.id} header={room.id}>
			    <ChatroomSchedule />
			    </Panel>
			);
		     })}
		</Accordion>
		<p>
		    <input type="text" valueLink={this.linkState('newChatroomID')} placeholder="Enter id" />
		    <button disabled={!this.state.newChatroomID} onClick={this._addChatroom}>Add chatroom</button>
		</p>
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
	    chatrooms: {$push: [{id: this.state.newChatroomID}]},
	    newChatroomID: {$set: ""}
	}));
    }
});

module.exports = ChatroomSettings;
