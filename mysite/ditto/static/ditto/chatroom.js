var BOSH_SERVICE = '/http-bind/'
var connection = null;


function onMessage(msg) {
    var msg = $(msg);
    var body = msg.find("body:first").text();
    var from = msg.attr("from");

    console.log(from, body, msgs);

    var msgs = $('#msgs');
    var p = $('<p></p>');
    p.text(from + ': ' + body);
    msgs.append(p);
    msgs.scrollTop(msgs[0].scrollHeight);
    
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


$(document).ready(function () {
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
    
});
