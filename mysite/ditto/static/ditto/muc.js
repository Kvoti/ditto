//
// Group chat
//
(function () {
    var chatroom = 'muc1@muc.' + DITTO.chat_host;
    var presence = {};
    var presence_ui = $('#presence');

    $(document).on('connected.ditto.chat', function (e, conn) {
        connection = conn;
	connection.muc.init(connection);

	// temp nick workaround while we figure out the page refresh/multiple tabs stuff
	var nick = DITTO.chat_nick + '-' + Math.floor(Math.random(1, 5) * 100);

	connection.muc.join(chatroom, nick, onGroupMessage, onGroupPresence);
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
	// handle the nick hack
	if (from) {
	    from = from.split('-')[0];
	}
	DITTO.chat.renderMessage(from, body);
	// // check for errors
	// var error = msg.find('error');
	// if (error.length) {
	//     // TODO presume there can be a bunch of errors to handle?
	//     formatted_message.addClass('bg-danger');
	// }
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
