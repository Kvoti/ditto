$(document).ready(function () {
    // TODO try websockets too
    var BOSH_SERVICE = '/http-bind/';
    var connection = null;
    var chatroom = 'muc1@muc.' + DITTO.chat_host;
    var presence = {};
    var presence_ui = $('#presence');

    // TODO tidy up properly
    window.onunload = function () {
	connection.muc.leave(
	    chatroom,
	    DITTO.chat_nick,
	    function () {
		connection.disconnect();
	    }
	);
    };
	
    function rawInput(data)
    {
	// console.log('RECV: ', data);
    }

    function rawOutput(data)
    {
	// console.log('SENT: ', data);
    }
    
    function onMessage(msg) {
        // console.log(msg);
        var msgs = $('#msgs');

	// extract sender and message text
        var msg = $(msg);
        var body = msg.find("body:first").text();
        var from = msg.attr("from").split('/')[1];

	// construct message markup
	var formatted_message = $(message_template);
        formatted_message.find('.media-body').text(body);
	var avatar = formatted_message.find('img');
	// TODO check .attr with untrusted input is safe!
	avatar.attr('data-src', 'holder.js/50x50/auto/sky/text:' + from);
	avatar.attr('alt', from);
	Holder.run({images:formatted_message.find('img')[0]});

	// check for errors
	var error = msg.find('error');
	if (error.length) {
	    // TODO presume there can be a bunch of errors to handle?
	    formatted_message.addClass('bg-danger');
	}
	
	// add message to page and scroll message in to view
        msgs.append(formatted_message);
        msgs.scrollTop(msgs[0].scrollHeight);

	// return true so this handler gets run again
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
            connection.muc.init(connection);

	    // TODO trying on demand room creation from js but can't get it to work
	    // (_probably_ not needed as we can configure the site chatrooms in config)
	    // connection.muc.listRooms(
	    // 	'localhost',
	    // 	function (r) { console.log(r) },
	    // 	function (r) { console.log(r) }
	    // );
	    // connection.muc.createInstantRoom(
	    // 	'muc1@muc.localhost',
	    // 	function (r) { console.log(r) },
	    // 	function (r) { console.log(r) }
	    // );
	    
	    // temp workaround while we figure out the page refresh/multiple tabs stuff
	    var nick = DITTO.chat_nick + Math.floor(Math.random(1, 5) * 100);
            connection.muc.join(chatroom, nick, onMessage, onPresence);
	}
    }
    
    connection = new Strophe.Connection(BOSH_SERVICE);
    connection.rawInput = rawInput;
    connection.rawOutput = rawOutput;

    connection.connect(
	DITTO.chat_name, DITTO.chat_pass, onConnect
    );

    $('#msg').submit(function (e) {
        e.preventDefault();
        var input = $(this).find('input[type=text]');
        var msg = input.val();
        input.val('');
        if (msg) {
            // TODO handle errors
            connection.muc.groupchat(chatroom, msg);
        }
    });
    $('#msg').find('input[type=text]').focus();
    
    var message_template = $('#message_template').text();
    
});
