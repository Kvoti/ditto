$(document).ready(function () {
    var BOSH_SERVICE = '/http-bind/';
    var connection = null;

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
            connection.muc.join('muc1@muc.localhost', d.toISOString(), onMessage);
        }
    }
    
    connection = new Strophe.Connection(BOSH_SERVICE);
    // TODO how to authenticate to keep these details private??
    connection.connect('mark@localhost', 'pass', onConnect);

    $('#msg').submit(function (e) {
        e.preventDefault();
        var input = $(this).find('input[type=text]');
        var msg = input.val();
        input.val('');
        if (msg) {
            // TODO handle errors
            connection.muc.groupchat('muc1@muc.localhost', msg);
        }
    });
    $('#msg').find('input[type=text]').focus();
    
    var message_template = $('#message_template').text();
    
});
