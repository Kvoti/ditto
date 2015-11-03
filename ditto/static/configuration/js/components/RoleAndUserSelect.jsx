var React = require('react/addons');
var CheckList = require('./CheckList.jsx');
var UserAutocomplete = require('../../../js/components/UserAutocomplete.jsx');
var RoleStore = require('../stores/RoleStore');

function getStateFromStores () {
    return {
	roles: RoleStore.getAll(),
    }
}

var RoleAndUserSelect = React.createClass({
    getInitialState () {
	return getStateFromStores();
    },
    
    componentDidMount () {
        RoleStore.addChangeListener(this._onChange);
    },

    componentWillUnmount () {
        RoleStore.removeChangeListener(this._onChange);
    },
    
    _onChange () {
        this.setState(getStateFromStores());
    },

  render () {
	console.log('selected', this.props.selectedRoles);
	return (
	    <div>
		<p>Select roles:
		    <CheckList
			    items={this.state.roles}
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
