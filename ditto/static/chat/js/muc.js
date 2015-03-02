//
// Group chat
//
(function () {
    var connection;
    var chatroom = DITTO.room + '@muc.' + DITTO.chat_host;
    var presence = [];
    var presence_ui = $('#presence');

    DITTO.chat.presence = presence;
    DITTO.chat.presence_ui = presence_ui;
    
    $(document).on('connected.ditto.chat', function (e, conn) {
        connection = conn;
	connection.muc.init(connection);
	connection.muc.join(chatroom, DITTO.chat_nick, onGroupMessage, onGroupPresence);
    });

    $(document).on('disconnected.ditto.chat', function () {
        alert('You got disconnected, maybe you opened another tab or device?');
        window.location.href = '../';
    });
    
    DITTO.chat.sendMessage = function (msg) {
	// TODO we could optimistically render the message before we receive it back
	// (though it's pretty quick!)
	connection.muc.groupchat(chatroom, msg);
    }
    
    function onGroupMessage(msg) {
        var msg = $(msg);
        var body = msg.find("body:first").text();
        var from = msg.attr("from").split('/')[1];
        var when = msg.find('delay');
        
        if (when.length) {
            when = new Date(when.attr('stamp'));
        } else {
            when = new Date();
        }

        if (from) {
            // TODO always get an 'empty' message from the room
            // itself, not sure why
	    DITTO.chat.renderGroupMessage(from, when, body);
        }
        return true;
    }

    function onGroupPresence(pres) {
	var msg = $(pres);
	var nick_taken = msg.find('conflict');
        var from = msg.attr('from').split('/')[1];
	if (nick_taken.length) {
	    $('#myModal').modal('show');
	}

	var added = msg.find('item[role!=none]');
	if (added.length) {
	    presence.splice(0, 0, from);
	    DITTO.chat.renderPresence();
	}

	var removed = msg.find('item[role=none]');
	if (removed.length) {
	    presence.splice(presence.indexOf(from), 1);
	    DITTO.chat.renderPresence();
	}

        // First time we enter the chatroom for a new network the room
        // needs to be created and configured
        var is_new_room = msg.find('status[code=201]');
        if (is_new_room.length) {
            // TODO handle failure
            connection.muc.createInstantRoom(chatroom);
        }
	
	return true;
    }

})();
