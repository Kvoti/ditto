var React = require('react/addons');
var update = React.addons.update;
var CheckList = require('./CheckList.jsx');
var Accordion = require('react-bootstrap/lib/Accordion');

var ChatroomSettings = React.createClass({
    getInitialState () {
	return {
	    creatorRoles: [],
	    creatorUsers: [],
	    chatrooms: []
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
	    </div>
	);
    },
    
    _updateRoles (roles) {
	this.setState({creatorRoles: roles});
    },
    
});

module.exports = ChatroomSettings;
