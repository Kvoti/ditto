var React = require('react');
var UserProfileStore = require('../stores/UserProfileStore');
var avatarSVGs = $('#avatar_svgs').text();

function getStateFromStores() {
    return {
        userProfiles: UserProfileStore.get(),
    };
}

var Avatar = React.createClass({
    propTypes: {
        size: React.PropTypes.number
    },
    getDefaultProps: function () {
        return {size: 50}
    },
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
	var avatarName;
	var profile = this.state.userProfiles[this.props.user];
	if (profile) {
	    avatarName = profile.avatar;
	} else {
	    avatarName = 'cupcake'
	}
	// TODO better way to generate svg without jquery/outerHTML, convert svg to react component?
	var avatarSVG = $(avatarSVGs);
	if (avatarName) {
	    avatarSVG.find('>g[id!=' + avatarName + ']').remove();
	    avatarSVG.find('>g').show();
	    avatarSVG.attr({
		width: this.props.size,
		height: this.props.size
	    });
	    avatarSVG = avatarSVG.get(0).outerHTML;
	} else {
	    avatarSVG = '';
	}
	return (
	    <div className="avatar">
		<div dangerouslySetInnerHTML={{__html: avatarSVG}} />
	    </div>
	);
    },

    _onChange: function() {
	this.setState(Chat.getUserProfiles());
    },
});

module.exports = Avatar;
