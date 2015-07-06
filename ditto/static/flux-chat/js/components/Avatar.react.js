var React = require('react');
var UserProfileStore = require('../stores/UserProfileStore');
var avatarSVGs = $('#avatar_svgs').text();
var MessageLink = require('../../../js/components/MessageLink.jsx');

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
        return {
            size: 50,
            link: true
        }
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
	var avatar, avatarName;
	var profile = this.state.userProfiles[this.props.user];
	if (profile) {
	    avatarName = profile.avatar;
	} else {
            // Show nothing until profiles are loaded and we know
            // what avatar to show.
            return null;
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
        avatar = <div className="avatar" style={{width:this.props.size,margin:'auto'}} dangerouslySetInnerHTML={{__html: avatarSVG}} />;
        if (this.props.link) {
            avatar = (
                <MessageLink from={DITTO.user} to={this.props.user}>
                    {avatar}
                </MessageLink>
            );
        }
	return avatar;
    },

    _onChange: function() {
	this.setState(getStateFromStores());
    },
});

module.exports = Avatar;
