//
// '<partner> is typing...' notification
//
// We support the 'active' and 'composing' states
//
(function () {
    var connection;
    var other_is_typing_notification;
    var i_am_composing = false;
    var last_keypress;
    var typing_pause = 2000;  // 2 seconds
    
    $(document).on('connected.ditto.chat', function (e, conn) {
        connection = conn;
	connection.chatstates.init(connection);
    });

    DITTO.chat.message_input.keypress(function () {
	last_keypress = new Date();
	if (!i_am_composing) {
	    // spec says we don't send multiples of the same
	    // notifications in succession
	    connection.chatstates.sendComposing(DITTO.chatee);
	    i_am_composing = true;
	    window.setTimeout(check_i_am_still_typing, typing_pause);
	}
    });
    
    var check_i_am_still_typing = function () {
	console.log('checking typing');
	if (i_am_composing) {
	    var now = new Date();
	    if (now - last_keypress > typing_pause) {
		console.log('stopped typing');
		i_am_composing = false;
		last_keypress = undefined;
		connection.chatstates.sendActive(DITTO.chatee);
	    } else {
		console.log('still typing');
		window.setTimeout(check_i_am_still_typing, typing_pause);
	    }
	}
    };
    
    DITTO.chat.addPrivateMessageCallback(function (msg) {
	// The chatstates plugin let's you register jquery event
	// handlers to handle these state changes but I couldn't get
	// it to work: sending <active/> in the sent message didn't
	// trigger the active.chatstates event.
 	console.log('GOT', msg);
	var msg = $(msg);
	var from = msg.attr("from").split('@')[0],
	    composing = msg.find('composing'),
	    active = msg.find('active');
	
	if (composing.length) {
	    this.renderPrivateMessage(from, "is typing ...");
	    other_is_typing_notification = this.pchat_msgs.find('>div').get(-1);	    
	    return false; // to prevent further message processing
	} else if (active.length) {
	    other_is_typing_notification.remove();
	}
	return true;
    });
    
    DITTO.chat.addOutgoingMessageCallback(function (msg) {
	// spec says to send <active/> with message when using chatstates
	connection.chatstates.addActive(msg);
	i_am_composing = false;
	return true;
    });
    
})();
