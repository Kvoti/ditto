//
// Core private chat functionality
//
(function () {
    var connection;
    
    $(document).on('connected.ditto.chat', function (e, conn) {
        connection = conn;
	connection.send($pres().tree());
	connection.addHandler(onPrivateMessage, null, 'message', 'chat',  null);
    });

    function onPrivateMessage (msg) {
	$.each(DITTO.chat.privateMessageCallbacks, function (i, callback) {
	    return callback.apply(DITTO.chat, [msg]);
	});
	return true;  // so we are called again
    }
    
    DITTO.chat.addPrivateMessageCallback(function (msg) {
	var msg = $(msg);
	var body = msg.find("body:first").text();
	var from = msg.attr("from").split('@')[0];

	if (body) {
	    this.renderMessage(from, body);
            // return false to prevent further processing of this message
            return false;
        }
	return true;
    });

    DITTO.chat.sendMessage = function (msg) {
	var payload = $msg({
	    to: DITTO.chatee,
	    from: DITTO.chat_name,
	    type: 'chat'
	}).c('body').t(msg);

	$.each(this.outgoingMessageCallbacks, function (i, callback) {
	    return callback.apply(this, [payload]);
	});		

	connection.send(payload.tree());

	DITTO.chat.renderMessage(this.me, msg);
    };
    
})();
