var React = require('react/addons');
var CheckList = require('./CheckList.jsx');
var UserAutocomplete = require('../../../js/components/UserAutocomplete.jsx');

var RoleAndUserSelect = React.createClass({

    render () {
	return (
	    <div>
		<p>Select roles:
		    <CheckList
			    items={this.props.roles}
			    selected={this.props.selectedRoles}
			    onChange={this.props.onChangeRoles} />
		</p>
		<p>Select users</p>
		<UserAutocomplete
			value={this.props.users}
			multi={true}
			onChange={this.props.onChangeUsers}
			/>
	    </div>
	);
    },
    
});

module.exports = RoleAndUserSelect;
