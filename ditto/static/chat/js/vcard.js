//
// vCards
//
// We use vCards to set/get role and avatar information
//
// TODO figure out how to broadcast changes to the vcard as mongoose doesn't do pubsub
(function () {
    var connection;
    
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
            // TODO cache the result and don't send multiple request for the same vcard
            var placeholder = $('<span></span>');
            connection.vcard.get(
                function (vcard) {
                    var role = $(vcard).find('ROLE').text();
                    placeholder.text(role);
                },
                user + '@' + DITTO.chat_host
            )
            return placeholder;
        }
    }
    
})();
