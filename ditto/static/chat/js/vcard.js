//
// vCards
//
// We use vCards to set/get role and avatar information
//
// TODO figure out how to broadcast changes to the vcard as mongoose doesn't do pubsub
(function () {
    var connection;
    var roles = {};
    var avatars = {};
    var avatars_graphics = $('#avatar_svgs').text();
    
    $(document).on('connected.ditto.chat', function (e, conn) {
        connection = conn;
        connection.vcard.init(connection);
    });

    DITTO.chat.vcard = {

	set: function (avatar_name) {
	    // TODO no convenience function provided for making vcards?
	    var role = Strophe.xmlElement('ROLE');
	    role.appendChild(Strophe.xmlTextNode(DITTO.role));
	    var photo = Strophe.xmlElement('PHOTO');
	    photo.appendChild(Strophe.xmlTextNode(avatar_name || 'sunshine'));  // TODO prob make this full URI of avatar?
            // TODO looks like strophe.vcard doesn't allow setting multiple elements?
            // (sort of doesn't matter cos the data you set isn't validated, which is ok
            // while we assume no other clients will connect)
            var vcard = Strophe.xmlElement('XXX');
            vcard.appendChild(role);
            vcard.appendChild(photo);

	    console.log('setting', vcard);
	    
            // TODO handle error
	    connection.vcard.set(
		function (r) { console.log('set', r); },
		vcard
	    );
	},

        getRole: function (user) {
            // TODO don't send multiple request for the same vcard
            var placeholder = $('<span></span>');
            var role = roles[user];
            if (role) {
                placeholder.text(role);
            } else {
                connection.vcard.get(
                    function (vcard) {
                        console.log(vcard);
                        var role = $(vcard).find('ROLE').text();
                        roles[user] = role;
                        placeholder.text(role);
                    },
                    user + '@' + DITTO.chat_host
                );
            }
            return placeholder;
        },

        // TODO only need on function to get/unpack the vcard data, no need to call for each item
        getAvatarGraphic: function (user, size) {
            // TODO don't send multiple request for the same vcard
            var placeholder = $('<p></p>');
            var avatar = avatars[user];
            if (avatar) {
                placeholder.append(_graphic(avatar, size));
            } else {
                connection.vcard.get(
                    function (vcard) {
                        var avatar = $(vcard).find('PHOTO').text();
			if (!avatar) {
			    avatar = 'sunshine';
			}
                        avatars[user] = avatar;
                        placeholder.append(_graphic(avatar, size));
                    },
                    user + '@' + DITTO.chat_host
                );
            }
            return placeholder;
        }
    };

    function _graphic (avatar_name, size) {
        var graphic = $(avatars_graphics);
        graphic.find('>g[id!=' + avatar_name + ']').remove();
        graphic.find('>g').show();
        graphic.attr({
            width: size,
            height: size
        });
        return graphic;
    }
    
})();
