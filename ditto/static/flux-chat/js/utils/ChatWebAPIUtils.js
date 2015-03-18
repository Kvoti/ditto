require('strophe');
// require('strophe-plugins/rsm');
// require('strophe-plugins/mam');
// require('strophe-plugins/roster');
// require('strophe-plugins/vcard');
// require('strophe-plugins/chatstates');
// require('strophe-plugins/muc');
var ChatServerActionCreators = require('../actions/ChatServerActionCreators');
var Parse = require('./XMPPParser.js');

var _connection, _jid, _chatroom, _nick;

Strophe.log = function (level, msg) {
    console.log(msg);
};

function onConnect (status_code) {
    if (status_code == Strophe.Status.CONNECTED) {
        sendInitialPresence();
	addPrivateChatHandlers();
	// loadPrivateChatHistory();
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

function receivePrivateMessage (msg) {
    var message = Parse.privateMessage(msg);
    if (message.composing.length) {
        // state.whosTyping.push(from);
    } else {
	if (message.active.length) {
	    // state.whosTyping.splice(state.whosTyping.indexOf(from), 1);
	}
	if (message.body) {
	    message.threadID = `${message.from}:${message.to}`;
	    message.threadName = `${message.from} and ${message.to}`;
	    message.authorName = message.from;
            ChatServerActionCreators.receivePrivateMessage(message);
	}
    }
    return true;
}

function setupLogging () {
    _connection.rawInput = function (data) { console.log('RECV: ', data); };
    _connection.rawOutput = function (data) { console.log('SENT: ', data); };
}

module.exports = {

    connect: function (server, jid, password, chatroom, nick, log=false) {
	_jid = jid;
        _chatroom = _chatroom;
        _nick = _nick;
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

    createMessage: function(message, threadName) {
        // simulate writing to a database
        var rawMessages = JSON.parse(localStorage.getItem('messages'));
        var timestamp = Date.now();
        var id = 'm_' + timestamp;
        var threadID = message.threadID || ('t_' + Date.now());
        var createdMessage = {
            id: id,
            threadID: threadID,
            threadName: threadName,
            authorName: message.authorName,
            text: message.text,
            timestamp: timestamp
        };
        rawMessages.push(createdMessage);
        localStorage.setItem('messages', JSON.stringify(rawMessages));

        // simulate success callback
        setTimeout(function() {
            ChatServerActionCreators.receiveCreatedMessage(createdMessage);
        }, 0);
    }

};
