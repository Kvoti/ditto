var React = require('react/addons');
var update = React.addons.update;
var CheckList = require('./CheckList.jsx');
var ChatroomSchedule = require('./ChatroomSchedule.jsx');
var UserAutocomplete = require('../../../js/components/UserAutocomplete.jsx');
var Accordion = require('react-bootstrap/lib/Accordion');

var ChatroomSettings = React.createClass({
    getInitialState () {
	return {
	    creatorRoles: [],
	    creatorUsers: [],
	}
    },
    
    render () {
	return (
	    <div>
		<p>Select which roles can create chatrooms:
		    <CheckList
			    items={this.props.roles}
			    selected={this.state.creatorRoles}
			    onChange={this._updateRoles} />
		</p>
		<p>Select users who can create chatrooms</p>
		<UserAutocomplete
			value={this.state.creatorUsers.length ?
			       this.state.creatorUsers.join('|') : null
			       }
			multi={true}
			onChange={this._updateUsers}
			/>
		<ChatroomSchedule />
	    </div>
	);
    },
    
    _updateRoles (roles) {
	this.setState({creatorRoles: roles});
    },

    _updateUsers (users) {
	this.setState({creatorUsers: users.split('|')});
    }
});

module.exports = ChatroomSettings;
