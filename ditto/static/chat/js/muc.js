//
// Group chat
//
(function () {
    var connection;
    var chatroom = DITTO.room + '@muc.' + DITTO.chat_host;
    var presence = {
        'Sophie B': 1,
        'Priti P': 1,
        'Dan H': 1,
        'Kate F': 1,
        'Sophie B': 1,
        'Henry K': 1,
        'Emma C': 1,
        'Tom McW': 1,
        'Barney D': 1,
        'Sarah D': 1,
        'Annie C': 1,
        'Femi O': 1,
        'Ellis F': 1,
        'Rich B': 1,
        'Paul T': 1,
        'Kendra G': 1,
        'Javelle S': 1,
        'Lenny K': 1,
        'Sophie B': 1,
        'Priti P': 1,
        'Dan H': 1,
        'Kate F': 1,
        'Sophie B': 1,
        'Henry K': 1,
        'Emma C': 1,
        'Tom McW': 1,
        'Barney D': 1,
        'Sarah D': 1,
        'Annie C': 1,
        'Femi O': 1,
        'Ellis F': 1,
        'Rich B': 1,
        'Paul T': 1,
        'Kendra G': 1,
        'Javelle S': 1,
        'Lenny K': 1,
    };
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

        if (from) {
            // TODO always get an 'empty' message from the room
            // itself, not sure why
	    DITTO.chat.renderMessage(from, body);
        }
        return true;
    }

    function onGroupPresence(pres) {
	var msg = $(pres);
	var nick_taken = msg.find('conflict');
	if (nick_taken.length) {
	    $('#myModal').modal('show');
	}

	var added = msg.find('item[role!=none]');
	if (added.length) {
	    presence[msg.attr('from').split('/')[1]] = 1;
	    DITTO.chat.renderPresence();
	}

	var removed = msg.find('item[role=none]');
	if (removed.length) {
	    delete presence[msg.attr('from').split('/')[1]];
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
