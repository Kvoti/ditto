var React = require('react');
import { updateUserAvatar } from '../../tidy/js/profile/utils/WebAPIUtils';

var AvatarPicker = React.createClass({
    getAvatars: function () {
	// TODO tidy up avatar/svg handling
	var avatarSVGs = $($('#avatar_svgs').text());
	var avatars = [];
        avatarSVGs.find('g').show();
        avatarSVGs.find('>g[id!=guides]').each(function () {
            var svg_clone = avatarSVGs.clone();
            svg_clone.find('>g').remove();
            svg_clone.append($(this));
	    avatars.push([$(this).attr('id'), svg_clone.get(0).outerHTML]);
        });
	return avatars;
    },
    render: function () {
	var avatars = this.getAvatars().map(avatar => {
	    var avatarName = avatar[0];
	  var changeAvatar = function () {
            updateUserAvatar(DITTO.other, avatarName);
	    }
	    return (
		<li key={avatarName}><a onClick={changeAvatar} dangerouslySetInnerHTML={{__html: avatar[1] }} href="#"></a></li>
	    );
	});
	return (
	    <div className="btn-group">
                <button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                    Change avatar <span className="caret"></span>
                </button>
                <ul className="dropdown-menu" role="menu">
		    {avatars}
                </ul>
            </div>
	);
    }
});

module.exports = AvatarPicker;
