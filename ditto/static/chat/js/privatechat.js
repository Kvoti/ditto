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
        console.log('pm', msg);
	var msg = $(msg);
	var body = msg.find("body:first").text();
	var from_jid = msg.attr("from");
        var from = from_jid.split('@')[0];
	if (body && Strophe.getBareJidFromJid(from_jid) === DITTO.chatee) {
	    this.renderPrivateMessage(from, new Date(), body);
            if (this.isPageHidden()) {
                this.notifyNewMessage();
            }
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

	DITTO.chat.renderPrivateMessage(this.me, new Date(), msg, Strophe.getNodeFromJid(DITTO.chatee));
    };
    
})();
