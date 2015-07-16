var React = require('react');
var MessageLink = require('../../../js/components/MessageLink.jsx');
var avatarSVGs = $('#avatar_svgs').text();

var Avatar = React.createClass({
    propTypes: {
        username: React.PropTypes.string.isRequired,
        avatar: React.PropTypes.string.isRequired,
        size: React.PropTypes.number,
        link: React.PropTypes.bool,
    },

    getDefaultProps () {
        return {
            size: 50,
            link: true
        }
    },

    render () {
        var avatar = (
           <div className="avatar"
            style={{width:this.props.size,margin:'auto'}}
            dangerouslySetInnerHTML={{__html: this._avatarSVG()}}
                />
        );
        // TODO wrapping in a link might be better done in the parent,
        // or create a LinkedAvatar component?
        if (this.props.link) {
            avatar = (
                <MessageLink from={DITTO.user} to={this.props.username}>
                    {avatar}
                </MessageLink>
            );
        }
	return avatar;
    },

    _avatarSVG () {
	// TODO better way to generate svg without jquery/outerHTML, convert svg to react component?
	var avatarSVG = $(avatarSVGs);
	avatarSVG.find('>g[id!=' + this.props.avatar + ']').remove();
	avatarSVG.find('>g').show();
	avatarSVG.attr({
	    width: this.props.size,
	    height: this.props.size
	});
	return avatarSVG = avatarSVG.get(0).outerHTML;
    },

});

module.exports = Avatar;
