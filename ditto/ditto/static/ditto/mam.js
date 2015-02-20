//
// Load private chat history from the archive
//
(function () {
    var connection;

    $(document).on('connected.ditto.chat', function (e, conn) {
        var an_hour_ago = new Date();
        an_hour_ago.setHours(an_hour_ago.getHours() - 1);
        connection = conn;
	connection.mam.init(connection);
	connection.mam.query(
	    Strophe.getBareJidFromJid(DITTO.chat_name),
	    {
		'with': Strophe.getBareJidFromJid(DITTO.chatee),
                'start': an_hour_ago.toISOString(),
                // 'max': 10,
		onMessage: onArchivedPrivateMessage
	    }
	);
    });
    
    function onArchivedPrivateMessage(msg) {
	var msg = $(msg);
	var body = msg.find("body:first").text();
	var from = msg.find('message').attr("from").split('@')[0];
	DITTO.chat.renderMessage(from, body);
	return true;
    }

})();
