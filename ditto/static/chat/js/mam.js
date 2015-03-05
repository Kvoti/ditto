//
// Load private chat history from the archive
//
(function () {
    var connection;

    $(document).on('connected.ditto.chat', function (e, conn) {
        connection = conn;
	connection.mam.init(connection);
	connection.mam.query(
	    Strophe.getBareJidFromJid(DITTO.chat_name),
	    {
		'with': Strophe.getBareJidFromJid(DITTO.chatee),
                'before': "",
                'max': 20,
		onMessage: onArchivedPrivateMessage
	    }
	);
    });
    
    function onArchivedPrivateMessage(msg) {
        var msg = $(msg);
        var body = msg.find("body:first").text();
        var from = msg.find('message').attr("from").split('@')[0];
        var when = new Date(msg.find('delay').attr('stamp'));
        DITTO.chat.renderPrivateMessage(from, when, body);
        return true;
    }

})();
