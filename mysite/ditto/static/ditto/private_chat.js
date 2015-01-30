var BOSH_SERVICE = '/http-bind/';
var connection = null;
var message_template;

function log(msg) 
{
    console.log(msg);
}

function onConnect(status)
{
    if (status == Strophe.Status.CONNECTING) {
	log('Strophe is connecting.');
    } else if (status == Strophe.Status.CONNFAIL) {
	log('Strophe failed to connect.');
	$('#connect').get(0).value = 'connect';
    } else if (status == Strophe.Status.DISCONNECTING) {
	log('Strophe is disconnecting.');
    } else if (status == Strophe.Status.DISCONNECTED) {
	log('Strophe is disconnected.');
	$('#connect').get(0).value = 'connect';
    } else if (status == Strophe.Status.CONNECTED) {
	log('Strophe is connected.');
	log('ECHOBOT: Send a message to ' + connection.jid + 
	    ' to talk to me.');

	connection.addHandler(onMessage, null, 'message', null, null,  null); 
	connection.send($pres().tree());

        connection.mam.init(connection);
        var aa = connection.mam.query(
            'mark@localhost',
            {'with': DITTO.chatee,
             onMessage: function (r) { console.log('GGGG', r); return true },
             onComplete: function (r) { console.log('RRRR', r) },
            }
        );
        console.log('HEREE', aa);
    }
}

function onMessage(msg) {
    var to = msg.getAttribute('to');
    var from = msg.getAttribute('from');
    var type = msg.getAttribute('type');
    var elems = msg.getElementsByTagName('body');

    if (type == "chat" && elems.length > 0) {
        console.log('called');
        var msgs = $('#msgs');

	// extract sender and message text
        var msg = $(msg);
        var body = msg.find("body:first").text();
        var from = msg.attr("from").split('/')[1];

	// construct message markup
	var formatted_message = $(message_template);
        formatted_message.find('.media-body').text(body);
	// var avatar = formatted_message.find('img');
	// var avatar_theme = avatars[from];
	// if (!avatar_theme) {
	//     avatar_theme = themes[Math.floor(Math.random() * (themes.length - 1))];
	//     avatars[from] = avatar_theme;
	// }
	// // TODO check .attr with untrusted input is safe!
	// avatar.attr('data-src', 'holder.js/50x50/auto/' + avatar_theme + '/text:' + from);
	// avatar.attr('alt', from);
	// Holder.run({images:formatted_message.find('img')[0]});

	// add message to page and scroll message in to view
        console.log(formatted_message);
        msgs.append(formatted_message);
        msgs.scrollTop(msgs[0].scrollHeight);
        console.log(msgs);
	// var body = elems[0];

	// log('ECHOBOT: I got a message from ' + from + ': ' + 
	//     Strophe.getText(body));
    
	// var reply = $msg({to: from, from: to, type: 'chat'})
        //     .cnode(Strophe.copyElement(body));
	// connection.send(reply.tree());

	// log('ECHOBOT: I sent ' + from + ': ' + Strophe.getText(body));
    }

    // we must return true to keep the handler alive.  
    // returning false would remove it after it finishes.
    return true;
}

$(document).ready(function () {
    connection = new Strophe.Connection(BOSH_SERVICE);

    // Uncomment the following lines to spy on the wire traffic.
    // connection.rawInput = function (data) { log('RECV: ' + data); };
    connection.rawOutput = function (data) { log('SEND: ' + data); };

    // Uncomment the following line to see all the debug output.
    //Strophe.log = function (level, msg) { log('LOG: ' + msg); };

    connection.connect(
	DITTO.chat_name, DITTO.chat_pass, onConnect
    );
    
    $('#msg').find('input[type=text]').focus();
    
    $('#msg').submit(function (e) {
        e.preventDefault();
        var input = $(this).find('input[type=text]');
        var msg = input.val();
        input.val('');
        if (msg) {
            // no util functions to create proper message? what about id -- needed?
	    var reply = $msg({to: DITTO.chatee, from: DITTO.chat_name, type: 'chat'})
                .c('body').t(msg).up();
            // TODO handle errors
	    connection.send(reply.tree());
        }
    });

    message_template = $('#message_template').text();
});
