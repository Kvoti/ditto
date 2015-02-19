//
// Group chat
//
(function () {
    var connection;
    var chatroom = DITTO.room + '@muc.' + DITTO.chat_host;
    var presence = {};
    var presence_ui = $('#presence');

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
	console.log(msg);
        var msg = $(msg);
        var body = msg.find("body:first").text();
        var from = msg.attr("from").split('/')[1];

	DITTO.chat.renderMessage(from, body);
        return true;
    }

    function onGroupPresence(pres) {
	console.log('PRES', pres);
	var msg = $(pres);
	var nick_taken = msg.find('conflict');
	if (nick_taken.length) {
	    $('#myModal').modal('show');
	}

	var added = msg.find('item[role!=none]');
	if (added.length) {
	    presence[msg.attr('from').split('/')[1]] = 1;
	    renderPresence();
	}

	var removed = msg.find('item[role=none]');
	if (removed.length) {
	    delete presence[msg.attr('from').split('/')[1]];
	    renderPresence();
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

    function renderPresence() {
	var pres = $('<ul class="list-group"></ul>');
	$.each(presence, function (key) {
	    var item = $('<li class="list-group-item"></li>');
	    item.text(key);
	    pres.append(item);
	});
	presence_ui.empty();
	presence_ui.append(pres);
    }

})();
