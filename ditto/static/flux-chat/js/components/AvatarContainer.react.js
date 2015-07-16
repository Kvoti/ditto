var React = require('react');
var UserProfileStore = require('../stores/UserProfileStore');
var Avatar = require('./Avatar.react');

function getStateFromStores() {
    return {
        userProfiles: UserProfileStore.get(),
    };
}

var AvatarContainer = React.createClass({
    propTypes: {
        username: React.PropTypes.string.isRequired,
    },

    getInitialState () {
        return getStateFromStores();
    },

    componentDidMount() {
	UserProfileStore.addChangeListener(this._onChange);
    },

    componentWillUnmount() {
	UserProfileStore.removeChangeListener(this._onChange);
    },

    render () {
	var profile = this.state.userProfiles[this.props.username];
	if (profile) {
            return <Avatar {...this.props} avatar={profile.avatar} />;
	} else {
            // Show nothing until profiles are loaded and we know
            // what avatar to show.
            return null;
	}
    },

    _onChange() {
	this.setState(getStateFromStores());
    },
});

module.exports = AvatarContainer;
