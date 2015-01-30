$(document).ready(function () {
    var BOSH_SERVICE = '/http-bind/';  // TODO try websockets too
    var connection = null;
    var chatroom = 'muc1@muc.' + DITTO.chat_host;
    var presence = {};
    var presence_ui = $('#presence');
    var loading = true;
    var themes = ['sky', 'vine', 'lava', 'gray', 'industrial', 'social'];
    var avatars = {};
    var message_template = $('#message_template').text();
    var msgs = $('#msgs');
    var message_input = $('#msg').find('input[type=text]');
    var me = DITTO.chat_name.split('@')[0];
    
    message_input.focus();

    $('#msg').submit(function (e) {
        e.preventDefault();
	if (!connection) {
	    // TODO give user feedback that we're waiting on the connection?
	    return;
	}
        var msg = message_input.val();
        if (msg) {
            message_input.val('');
	    if (DITTO.chatee) {
		var payload = $msg({
		    to: DITTO.chatee,
		    from: DITTO.chat_name,
		    type: 'chat'
		}).c('body').t(msg);
		connection.send(payload.tree());
		renderMessage(me, msg);
	    } else {
		// TODO we could optimistically render the message before we receive it back
		// (though it's pretty quick!)
		connection.muc.groupchat(chatroom, msg);
	    }
        }
    });
    
    function connect () {
	connection = new Strophe.Connection(BOSH_SERVICE);
	connection.rawInput = rawInput;
	connection.rawOutput = rawOutput;
	
	connection.connect(
	    DITTO.chat_name, DITTO.chat_pass, onConnect
	);
    }
    
    function onConnect (status) {
	if (status == Strophe.Status.CONNECTING) {
	    console.log('Strophe is connecting.');

	} else if (status == Strophe.Status.CONNFAIL) {
	    console.log('Strophe failed to connect.');

	} else if (status == Strophe.Status.DISCONNECTING) {
	    console.log('Strophe is disconnecting.');

	} else if (status == Strophe.Status.DISCONNECTED) {
	    console.log('Strophe is disconnected.');

	} else if (status == Strophe.Status.CONNECTED) {
	    console.log('Strophe is connected.');

	    if (loading) {
		$('.progress').remove();
		loading = false;
	    }
	
	    if (DITTO.chatee) {
		connection.addHandler(onPrivateMessage, null, 'message', 'chat',  null); 
		connection.send($pres().tree());
		
		connection.mam.init(connection);
		connection.mam.query(
		    DITTO.chat_name,
		    {
			'with': DITTO.chatee,
			onMessage: onArchivedPrivateMessage
		    }
		);
	    } else {
		connection.muc.init(connection);
		// temp nick workaround while we figure out the page refresh/multiple tabs stuff
		var nick = DITTO.chat_nick + '-' + Math.floor(Math.random(1, 5) * 100);
		connection.muc.join(chatroom, nick, onGroupMessage, onPresence);
	    }
	}
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
	renderMessage(from, body);
	// // check for errors
	// var error = msg.find('error');
	// if (error.length) {
	//     // TODO presume there can be a bunch of errors to handle?
	//     formatted_message.addClass('bg-danger');
	// }
        return true;
    }

    function onArchivedPrivateMessage(msg) {
	console.log(msg);
	var msg = $(msg);
	var body = msg.find("body:first").text();
	var from = msg.find('message').attr("from").split('@')[0];
	renderMessage(from, body);
	return true;
    }
    
    function onPrivateMessage(msg) {
	console.log(msg);
	var msg = $(msg);
	var body = msg.find("body:first").text();
	var from = msg.attr("from").split('@')[0];
	renderMessage(from, body);
	return true;
    }
    
    function onPresence(pres) {
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

    function renderMessage (from, msg) {
	// construct skeleton message from template
	var formatted_message = $(message_template);

	// add message text
        formatted_message.find('.media-body').text(msg);

	// configure avatar
	var avatar = formatted_message.find('img');
	var avatar_theme = avatars[from];
	if (!avatar_theme) {
	    avatar_theme = themes[Math.floor(Math.random() * (themes.length - 1))];
	    avatars[from] = avatar_theme;
	}
	// TODO check .attr with untrusted input is safe!
	avatar.attr('data-src', 'holder.js/50x50/auto/' + avatar_theme + '/text:' + from);
	avatar.attr('alt', from);
	// decide whether avatar goes to the left or right
	if (from === me) {
	    formatted_message.find('.media-left').remove();
	    formatted_message.find('.media-body').css('text-align', 'right');
	} else {
	    formatted_message.find('.media-right').remove();
	}
	Holder.run({images:formatted_message.find('img')[0]});

	// add message to page and scroll message in to view
        msgs.append(formatted_message);
        msgs.scrollTop(msgs[0].scrollHeight);
    }
    
    function renderPresence() {
	presence_ui.empty();
	var pres = $('<ul class="list-group"></ul>');
	$.each(presence, function (key) {
	    var item = $('<li class="list-group-item"></li>');
	    item.text(key);
	    pres.append(item);
	});
	presence_ui.append(pres);
    }

    function rawInput(data) {
	console.log('RECV: ', data);
    }

    function rawOutput(data) {
	console.log('SENT: ', data);
    }

    connect();
});
