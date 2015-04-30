var ChatServerActionCreators = require('../actions/ChatServerActionCreators');
var XMPP = require('./xmpp.js');

var _connection, _domain, _me, _myJID, _chatroom, _nick;

// TODO I think this state is maybe in the wrong place
// E.g. if we have a ContactStore, it would request history and profile
// to be fetched when a contact is first added?
var historyLoadedFor = [];
var userProfileLoadedFor = [];
//

var sentIsTyping = {};

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
        _connection.chatstates.init(_connection);
        joinMainChatroom();
        ChatServerActionCreators.connect(_connection);
    } else if (status_code == Strophe.Status.DISCONNECTED) {
        ChatServerActionCreators.disconnect();
    }
};

function sendInitialPresence () {
    _connection.send($pres().tree());
}

function joinMainChatroom () {
    _connection.muc.init(_connection);
    _connection.muc.join(
        _chatroom,
        _nick,
        receiveGroupMessage,
	receiveGroupPresence
    );
};

function receiveGroupMessage (msg) {
    var message = XMPP.parse.groupMessage(msg);
    // TODO not sure about treating a group message as just another message. Makes some sense, as it's just another thread
    message.threadID = message.to;
    message.authorName = message.from;
    if (message.from) {
	// TODO always get an 'empty' message from the room
	// itself, not sure why
        ChatServerActionCreators.receivePrivateMessage(message);
    }
    return true;
};

function receiveGroupPresence (pres) {
    var presence = XMPP.parse.groupPresence(pres);
    if (presence.added) {
        ChatServerActionCreators.receiveOnline(presence.user);
    } else if (presence.removed) {
        ChatServerActionCreators.receiveOffline(presence.user);
    }
    if (presence.isNewRoom) {
        // TODO handle failure
        _connection.muc.createInstantRoom(
            chatConf.chatroom  // TODO support multiple group chats
        );
    }
    return true;
}

function addPrivateChatHandlers () {
    _connection.addHandler(receivePrivateMessage, null, 'message', 'chat',  null);
    _connection.addHandler(receivePresence, null, 'presence', null,  null); 
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
                'max': 3,
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
	ChatServerActionCreators.receiveStartTyping(message.from, message.threadID);
    } else {
	if (message.active.length) {
	    ChatServerActionCreators.receiveStopTyping(message.from, message.threadID);
	}
	if (message.text) {
            ChatServerActionCreators.receivePrivateMessage(message);
	}
    }
    return true;
}

var receiveArchivedPrivateMessage = function (msg) {
    var message = XMPP.parse.archivedPrivateMessage(msg);
    if (message) { // TODO don't need if when not querying group messages
	message.isRead = true;
        ChatServerActionCreators.receivePrivateMessage(message);
    }
    return true;
};

function receivePresence (pres) {
    var status = XMPP.parse.presence(pres);
    ChatServerActionCreators.receiveChatStatus(status);
    return true;
};

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
        _chatroom = chatroom;
        _nick = nick;
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
        if (message.threadID.indexOf(':') === -1) {
            _connection.muc.groupchat(
                _chatroom,  // TODO get from message or threadID
                message.text
            )
        } else {
	    // yuk
	    var participants = message.threadID.split(':');
	    var to = participants[0] === _me ? participants[1] : participants[0];
	    var payload = XMPP.create.privateMessage(
	        message.text,
	        _myJID,
	        getBareJIDForNode(to)
	    );
	    _connection.chatstates.addActive(payload);

            payload.c('thread').t(message.threadID);
            
	    delete sentIsTyping[threadID];
	    _connection.send(payload.tree()); // TODO handle error on message submit
        }
    },

    setStatus: function (code, message) {
	var pres = $pres();
	if (code) {
	    pres.c('show').t(code).up();
	}
	if (message) {
	    pres.c('status').t(message);
	}
	_connection.send(pres.tree());
    },

    // TODO only send this if other person is online? what's spec say?
    startTyping: function (threadID) {
	// yuk
	var participants = threadID.split(':');
	var to = participants[0] === _me ? participants[1] : participants[0];
	//
	if (!sentIsTyping[threadID]) {
	    sentIsTyping[threadID] = true;
	    _connection.chatstates.sendComposing(
	        getBareJIDForNode(to)
	    );
	}
    },

    stopTyping: function (threadID) {
	// yuk
	var participants = threadID.split(':');
	var to = participants[0] === _me ? participants[1] : participants[0];
	//
	delete sentIsTyping[threadID];
	_connection.chatstates.sendActive(
	    getBareJIDForNode(to)
	);
    },

    changeAvatar: function (avatarName) {
        // TODO no convenience function provided for making vcards?
        var role = Strophe.xmlElement('ROLE');
        role.appendChild(Strophe.xmlTextNode(chatConf.role));

        var photo = Strophe.xmlElement('PHOTO');
        photo.appendChild(Strophe.xmlTextNode(avatarName));  // TODO prob make this full URI of avatar?
        // TODO looks like strophe.vcard doesn't allow setting multiple elements?
        // (sort of doesn't matter cos the data you set isn't validated, which is ok
        // while we assume no other clients will connect)
        var vcard = Strophe.xmlElement('XXX');
        vcard.appendChild(role);
        vcard.appendChild(photo);

        // TODO handle error
        _connection.vcard.set(
	    function (r) { },  // TODO handle something here?
	    vcard
        );
    }
    
};
