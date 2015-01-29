$(document).ready(function () {
    // TODO try websockets too
    var BOSH_SERVICE = '/http-bind/';
    var connection = null;
    var chatroom = 'muc1@muc' + DITTO.chat_host;
    
    function onMessage(msg) {
        console.log(msg);
        var msgs = $('#msgs');

	// extract sender and message text
        var msg = $(msg);
        var body = msg.find("body:first").text();
        var from = msg.attr("from");

	// construct message markup
	var formatted_message = $(message_template);
        formatted_message.find('.media-body').text(body);
	var avatar = formatted_message.find('img');
	// TODO check .attr with untrusted input is safe!
	avatar.attr('data-src', 'holder.js/50x50/auto/sky/text:' + from);
	avatar.attr('alt', from);
	Holder.run({images:formatted_message.find('img')[0]});

	// add message to page and scroll message in to view
        msgs.append(formatted_message);
        msgs.scrollTop(msgs[0].scrollHeight);

	// return true so this handler gets run again
        return true;
    }

    function onConnect (status) {
        // TODO figure out nick stuff
        // Want to not need nicks and connect as real user, somehow authenticating with django
        var d = new Date();
        if (status === 5) {
            connection.muc.init(connection);
            connection.muc.join(chatroom, d.toISOString(), onMessage);
        }
    }
    
    connection = new Strophe.Connection(BOSH_SERVICE);
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
