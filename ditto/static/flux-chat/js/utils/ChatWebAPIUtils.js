var ChatServerActionCreators = require('../actions/ChatServerActionCreators');
var XMPP = require('./xmpp.js');

var _connection, _domain, _me, _myJID, _chatroom, _nick;

// TODO I think this state is maybe in the wrong place
// E.g. if we have a ContactStore, it would request history and profile
// to be fetched when a contact is first added?
var historyLoadedFor = [];
var userProfileLoadedFor = [];

Strophe.log = function (level, msg) {
    console.log(msg);
};

function onConnect (status_code) {
    if (status_code == Strophe.Status.CONNECTED) {
        sendInitialPresence();
	addPrivateChatHandlers();
        _connection.mam.init(_connection);
        getContacts();
        _connection.vcard.init(_connection);
        loadUserProfile(Strophe.getNodeFromJid(_myJID));
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

function getContacts () {
    _connection.roster.init(_connection);
    // _connection.roster.registerRequestCallback(acceptFriendRequest);
    _connection.roster.registerCallback(handleContacts);
    _connection.roster.get();
}

function handleContacts (roster, item) {
    // var friends = [];
    roster.forEach((friend, i) => {
	var username = Strophe.getNodeFromJid(friend.jid);
	if (friend.subscription === 'both') {
            loadPrivateChatHistory(friend.jid);
	    //     friends.push(username);
	    loadUserProfile(username);
	}
    });
    return true;
}

function loadPrivateChatHistory (contact) {
    if (historyLoadedFor.indexOf(contact) === -1) {
        historyLoadedFor.push(contact);
        _connection.mam.query(
            Strophe.getBareJidFromJid(_myJID),
            {
                'with': contact,
                'before': "",
                'max': 10,
                onMessage: receiveArchivedPrivateMessage
            }
        );
    }
}

function loadUserProfile (user) {
    var jid = getBareJIDForNode(user);
    if (userProfileLoadedFor.indexOf(user) === -1) {
	userProfileLoadedFor.push(user);
        _connection.vcard.get(
	    vcard => {
                var userProfile = XMPP.parse.vCard(vcard);
                userProfile.user = user;
                ChatServerActionCreators.receiveUserProfile(userProfile);
	    },
	    jid
        );
    }
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
