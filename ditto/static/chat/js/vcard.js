//
// vCards
//
// We use vCards to set/get role and avatar information
//
// TODO figure out how to broadcast changes to the vcard as mongoose doesn't do pubsub
(function () {
    var connection;
    var roles = {};
    
    $(document).on('connected.ditto.chat', function (e, conn) {
        connection = conn;

        connection.vcard.init(connection);
        
        // connection.vcard.get(
	//     function (r) { console.log(r); }
	// );
	
	// TODO no convenience function provided for making vcards?
	var vcard = Strophe.xmlElement('ROLE');
	vcard.appendChild(Strophe.xmlTextNode(DITTO.role));
        // TODO PHOTO (we'll use for avatar)
        
        // TODO handle error
	connection.vcard.set(
	    function (r) { console.log('set', r); },
	    vcard
	);
        
    });

    DITTO.chat.vcard = {

        getRole: function (user) {
            // TODO don't send multiple request for the same vcard
            var placeholder = $('<span></span>');
            var role = roles[user];
            if (role) {
                placeholder.text(role);
            } else {
                connection.vcard.get(
                    function (vcard) {
                        var role = $(vcard).find('ROLE').text();
                        roles[user] = role;
                        placeholder.text(role);
                    },
                    user + '@' + DITTO.chat_host
                )
            }
            return placeholder;
        }
    }
    
})();
