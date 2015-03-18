var ChatServerActionCreators = require('../actions/ChatServerActionCreators');
var XMPP = require('./xmpp.js');

var _connection, _domain, _me, _myJID, _chatroom, _nick;

Strophe.log = function (level, msg) {
    console.log(msg);
};

function onConnect (status_code) {
    if (status_code == Strophe.Status.CONNECTED) {
        sendInitialPresence();
	addPrivateChatHandlers();
	loadPrivateChatHistory();
        // configureFriends();
        // configureUserMeta();
        // connection.chatstates.init(connection);
        // joinChatroom();
        ChatServerActionCreators.connect(_connection);
    }
};

function sendInitialPresence () {
    _connection.send($pres().tree());
}

function addPrivateChatHandlers () {
    _connection.addHandler(receivePrivateMessage, null, 'message', 'chat',  null);
    // _connection.addHandler(handlePresence, null, 'presence', null,  null); 
}

function loadPrivateChatHistory () {
    _connection.mam.init(_connection);
    _connection.mam.query(
        Strophe.getBareJidFromJid(_myJID),
        {
            // TODO load last N messages for each chat not across all chats
            // 'with': Strophe.getBareJidFromJid(this.state.talkingTo),
            'before': "",
            'max': 50,
            onMessage: receiveArchivedPrivateMessage
        }
    );
}

function receivePrivateMessage (msg) {
    var message = XMPP.parse.privateMessage(msg);
    if (message.composing.length) {
        // state.whosTyping.push(from);
    } else {
	if (message.active.length) {
	    // state.whosTyping.splice(state.whosTyping.indexOf(from), 1);
	}
	if (message.text) {
	    setThreadFields(message);
            ChatServerActionCreators.receivePrivateMessage(message);
	}
    }
    return true;
}

var receiveArchivedPrivateMessage = function (msg) {
    var message = XMPP.parse.archivedPrivateMessage(msg);
    if (message) { // TODO don't need if when not querying group messages
	setThreadFields(message);
        ChatServerActionCreators.receivePrivateMessage(message);
    }
    return true;
};

// TODO possibly this should live in the XMPP.parse module
function setThreadFields(message) {
    var thread = [message.from, message.to];
    thread.sort();
    message.threadID = thread.join(':');
    message.threadName = thread.join(' and ');
    message.authorName = message.from;
}    

function setupLogging () {
    _connection.rawInput = function (data) { console.log('RECV: ', data); };
    _connection.rawOutput = function (data) { console.log('SENT: ', data); };
}

function getBareJIDForNode (node) {
    return node + '@' + _domain;
};

module.exports = {

    connect: function (server, jid, password, chatroom, nick, log=false) {
	_myJID = jid;
        _chatroom = _chatroom;
        _nick = _nick;
	_domain = Strophe.getDomainFromJid(jid);
	_me = Strophe.getNodeFromJid(jid);
	
        _connection = new Strophe.Connection('ws://' + server + ':5280/ws-xmpp');
        if (log) {
            setupLogging();
        }
        _connection.connect(
            jid,
	    password,
            onConnect
        );
    },
    
    getAllMessages: function() {
        // simulate retrieving data from a database
        var rawMessages = JSON.parse(localStorage.getItem('messages'));

        // simulate success callback
        ChatServerActionCreators.receiveAll(rawMessages);
    },

    createMessage: function(message, threadID) {
	// yuk
	var participants = message.threadID.split(':');
	var to = participants[0] === _me ? participants[1] : participants[0];
	var payload = XMPP.create.privateMessage(
	    message.text,
	    _myJID,
	    getBareJIDForNode(to)
	);
	// connection.chatstates.addActive(payload);
	// delete composedMessageChangeAt[to];
	_connection.send(payload.tree()); // TODO handle error on message submit
    }
};
