var React = require('react');
var UserProfileStore = require('../stores/UserProfileStore');

var aboutRoleURL = '/' + DITTO.tenant + '/people/';

function getStateFromStores() {
    return {
        userProfiles: UserProfileStore.get(),
    };
}

var Role = React.createClass({
    getInitialState: function () {
        return getStateFromStores();
    },

    componentDidMount: function() {
	UserProfileStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
	UserProfileStore.removeChangeListener(this._onChange);
    },

    render: function () {
	var roleName;
	var profile = this.state.userProfiles[this.props.user];
	if (profile) {
	    roleName = profile.role;
	} else {
	    roleName = '-'
	}
	return <a href={aboutRoleURL + '#' + roleName}>{roleName}</a>;
    },

    _onChange: function() {
	this.setState(getStateFromStores());
    },
});

module.exports = Role;
