// remove chatroom ghosts
// (happens with bosh, don't _think_ you get ghosts with websockets)
var connection;

connection = new Strophe.Connection('ws://' + 'localhost' + ':5280/ws-xmpp');
connection.rawInput = rawInput;
connection.rawOutput = rawOutput;

function removeFromChatroom (jid, nick) {
    connection.connect(
        jid, '', getConnector(jid, nick)
    );
    connection.rawInput = rawInput;
    connection.rawOutput = rawOutput;
}

function getConnector (jid, nick) {
    return function (status) {
        if (status == Strophe.Status.CONNECTED) {
            remove(jid, nick);
	}
    };
}

function remove (jid, nick) {
    console.log('removing', jid, nick);
    var presence = $pres({
        type: "unavailable",
        to: 'muc1@muc.localhost/' + nick
    });
    connection.send(presence.tree());
    // connection.disconnect();
}

function rawInput(data) {
    console.log('RECV: ', data);
}

function rawOutput(data) {
    console.log('SENT: ', data);
}

removeFromChatroom('sarah@localhost/Ditto', 'sarah-85');
