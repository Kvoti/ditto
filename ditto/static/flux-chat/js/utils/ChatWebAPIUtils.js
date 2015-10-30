var ChatServerActionCreators = require('../actions/ChatServerActionCreators');
var XMPP = require('./xmpp.js');
var ChatMessageUtils = require('./ChatMessageUtils');
var urlUtils = require('./urlUtils');
import UserProfileStore from '../stores/UserProfileStore';
import { get } from '../../../js/request';

var _connection, // raw connection
    _connectResolve,     
    _connectionStatus, _domain, _me, _myJID, _nick;
var _pendingFriends = [];

// TODO I think this state is maybe in the wrong place
// E.g. if we have a ContactStore, it would request history and profile
// to be fetched when a contact is first added?
var historyLoadedFor = [];
var userProfileLoadedFor = [];
//

var sentIsTyping = {};

// Strophe.log = function (level, msg) {
//     console.log(msg);
// };


var connect = new Promise((resolve, reject) => {
    _connectResolve = resolve;
});


function onConnectFactory (resolve) {
    return function (status_code) {
        _connectionStatus = status_code;
        if (status_code == Strophe.Status.CONNECTED) {
            sendInitialPresence();
	    addPrivateChatHandlers();
            _connection.mam.init(_connection);
            _connection.addHandler(
                receiveArchivedPrivateMessage, Strophe.NS.MAM, "message", null);        
            getContacts();
            loadUserProfile(Strophe.getNodeFromJid(_myJID));
            _connection.chatstates.init(_connection);
            if (chatConf.hasChatroom) {
                _connection.muc.init(_connection);
	      addGroupChatHandlers();
            }
            if (_pendingFriends.length) {
                _pendingFriends.forEach(f => addFriend(f));
            }
            resolve(_connection);
            ChatServerActionCreators.connect(_connection);
        } else if (status_code == Strophe.Status.DISCONNECTED) {
            ChatServerActionCreators.disconnect();
        }
    }
};

function sendInitialPresence () {
    _connection.send($pres().tree());
}

var getChatrooms = new Promise((resolve, reject) => {
    // TODO not sure here about using a promise inside a promise
    // TODO fix this hack to workaround problems joining the main chatroom
    // when viewing private messages. For now we don't join the chatroom
    // as private and group threads are intermingled in the thread store
    // and that breaks thinsgs.
    if (window.location.href.indexOf('messages') === -1 &&
        window.location.href.indexOf('sessions') === -1) {
        connect.then(connection => {
            var chatDomain = 'muc.' + _domain; // TODO pass in from config
            connection.muc.listRooms(
                chatDomain,
                receiveChatrooms(resolve),
                reject
            )
        });
    }
});

// TODO is there a better pattern to use here?
// Want getChatrooms to be a promise but want .then funcs to receive the parsed roomList
// not the raw XMPP result. Seems I'm going to be writing a lot of factory functions to
// return functions that call `resolve`...
function receiveChatrooms (resolve) {
    return function (result) {
        console.log('got chatrooms');
        var roomList = XMPP.parse.roomList(result);
        resolve(roomList);
	ChatServerActionCreators.receiveChatrooms(roomList);
    }
};

getChatrooms.then(roomList => {
    if (roomList.length) {
	// TODO something better than these path inspection hacks, pass some explicit option?
	if (window.location.href.indexOf('chatroom') === -1) {
            // Anywhere outside of /chatrooms/ we just want to join the 'main' site chatroom
          let mainRoom = roomList.find(r => r.startsWith('main'));
          console.log('joining', mainRoom);
          joinChatroom(mainRoom);
	}
    }
});

function joinChatroom (roomJID) {
    if (!chatConf.hasChatroom) {
        return;
    }
    Promise.all([
        connect,  // TODO not sure this is need as getChatrooms already depends on it
        getChatrooms
    ]).then(result => {
        var [connection, roomList] = result;
        if (roomList.indexOf(roomJID) === -1) {
            console.log('No such room', roomList);
            return;
        }
        // TODO this isn't quite the right place, should probably do
        // when get presence back confirming room join
        ChatServerActionCreators.joinChatroom(roomJID);
        connection.muc.join(
            roomJID,
            _nick
        );
    });
}


function receiveGroupMessage (msg) {
    var message = XMPP.parse.groupMessage(msg);
    // TODO not sure about treating a group message as just another message. Makes some sense, as it's just another thread
    message.threadID = message.to;
    message.authorName = message.from;
    if (message.from) {
	// TODO always get an 'empty' message from the room
	// itself, not sure why
      ChatServerActionCreators.receivePrivateMessage(message, true);
    }
    return true;
};

function receiveGroupPresence (pres) {
    var presence = XMPP.parse.groupPresence(pres);
    if (presence.added) {
      ChatServerActionCreators.receiveOnline(presence.user, presence.room);
      loadUserProfile(presence.user);
    } else if (presence.removed) {
        ChatServerActionCreators.receiveOffline(presence.user, presence.room);
        if (presence.destroyed) {
            ChatServerActionCreators.leaveChatroom(presence.room);
        }        
    } 
    // TODO ChatServerActionCreators.joinChatroom
    return true;
}

function addPrivateChatHandlers () {
    _connection.addHandler(receivePrivateMessage, null, 'message', 'chat',  null);
    _connection.addHandler(receivePresence, null, 'presence', null,  null); 
}

function addGroupChatHandlers() {
  _connection.addHandler(receiveGroupMessage, null, 'message', 'groupchat', null);
  _connection.addHandler(receiveGroupPresence, null, 'presence', null, null);
}

function getContacts () {
    _connection.roster.init(_connection);
    _connection.roster.registerRequestCallback(acceptFriendRequest);
    _connection.roster.registerCallback(handleContacts);
    _connection.roster.get();
}

function addFriend(friend) {
    if (_connectionStatus === Strophe.Status.CONNECTED) {
        _connection.roster.subscribe(getBareJIDForNode(friend));
    } else {
        _pendingFriends.push(friend);
    }
}

function acceptFriendRequest (from) {
    _connection.roster.authorize(from);
    return true;
}

function handleContacts (roster, item) {
    // var friends = [];
    roster.forEach((friend, i) => {
	var username = Strophe.getNodeFromJid(friend.jid);
	if (friend.subscription !== 'none') {
          loadPrivateChatHistory(friend.jid, "");
	    //     friends.push(username);
	    loadUserProfile(username);
	}
    });
    return true;
}

function loadPrivateChatHistory (contact, before) {
    if (historyLoadedFor.indexOf(contact) === -1 || before) {
        historyLoadedFor.push(contact);
      _connection.mam.query(
            Strophe.getBareJidFromJid(_myJID),
            {
                'with': contact,
              'before': before,
                'max': 20,
                // TODO strophe.mam is a bit broken.
                // It adds onMessage as handler for all received messages so
                // if you send off multiple queries in parallel the handler is
                // called several times. To workaround we add receiveArchivedPrivateMessage
                // once above and pass a noop here.
                // TODO remove the noop otherwise we're adding one each time we do a query
              onMessage: function () { },
              onComplete: msg => {
                let first = XMPP.parse.RSM(msg);
                if (first) {
                  loadPrivateChatHistory(contact, first);
                }
              }
            }
      );
    }
}

function loadUserProfile (user) {
  console.log('loading profile', user);
  var jid = getBareJIDForNode(user);
  if (userProfileLoadedFor.indexOf(user) === -1) {
    userProfileLoadedFor.push(user);
    get(
      // TODO fix hardcoded url
      `/di/api/users/${user}/`)
      .done(res => {
        ChatServerActionCreators.receiveUserProfile(res);
      });
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
	if (message.ended.length) {
	    ChatServerActionCreators.receiveEndThread(message.threadID, null);
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
      ChatServerActionCreators.receivePrivateMessage(message, true);
	if (message.ended.length) {
	    ChatServerActionCreators.receiveEndThread(message.threadID);
            // TODO not sure where this call belongs
            getSessionRating(
                message.threadID,
                // TODO use Promise here?
                rating => ChatServerActionCreators.receiveSessionRating(
                    message.threadID,
                    // TODO prob getSession should do this unpacking?
                    rating.rating
                )
            )
	}
    }
    return true;
};

function receivePresence (pres) {
    var status = XMPP.parse.presence(pres);
    ChatServerActionCreators.receiveChatStatus(status);
    return true;
};

function getSessionRating (threadID, callback) {
    $.get(urlUtils.getSessionRating(threadID)).done(callback);
}

function setupLogging () {
    _connection.rawInput = function (data) { console.log('RECV: ', data); };
    _connection.rawOutput = function (data) { console.log('SENT: ', data); };
}

function getBareJIDForNode (node) {
    return node + '@' + _domain;
};

module.exports = {

    connect: function (server, jid, password, nick, log=false) {
	_myJID = jid;
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
            onConnectFactory(_connectResolve)
        );
    },
    
    getAllMessages: function() {
        // simulate retrieving data from a database
        var rawMessages = JSON.parse(localStorage.getItem('messages'));

        // simulate success callback
        ChatServerActionCreators.receiveAll(rawMessages);
    },

    createMessage: function(message, threadID) {
        var roomJID;
        if (message.threadID.indexOf(':') === -1) {
            roomJID = message.threadID + '@muc.' + _domain; // TODO fix hardcoded chat domain
            _connection.muc.groupchat(
                roomJID,
                message.text
            )
        } else {
	    var to = ChatMessageUtils.getMessageOther(message.threadID);
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
	var to = ChatMessageUtils.getMessageOther(threadID);
	if (!sentIsTyping[threadID]) {
	    sentIsTyping[threadID] = true;
	    _connection.chatstates.sendComposing(
	        getBareJIDForNode(to)
	    );
	}
    },

    stopTyping: function (threadID) {
	var to = ChatMessageUtils.getMessageOther(threadID);
	delete sentIsTyping[threadID];
	_connection.chatstates.sendActive(
	    getBareJIDForNode(to)
	);
    },

    joinChatroom: joinChatroom,
    
    addFriend: addFriend,

    startSession: function (threadID, participants) {
	var url = urlUtils.startSession();
        $.ajax({
            url: url,
            type: "POST",
            data: JSON.stringify({
		session_id: threadID,
		ratings: [for (p of participants) {user: p}]
	    }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            error: () => console.log('startsession failed')
        })        
    },

    rateThread (threadID, rating) {
	var url = urlUtils.rateSession(threadID);
        $.ajax({
            url: url,
            type: "PUT",
            data: JSON.stringify({
		rating: rating
	    }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            error: () => console.log('rate session failed')
        })        
    },
    
    endThread: function (threadID) {
	var to = ChatMessageUtils.getMessageOther(threadID);
	var payload = $msg({
	    from: _myJID,
	    to: getBareJIDForNode(to),
	    type: 'chat'
	});
        payload.c('ended').up();
        payload.c('thread').t(threadID).up();
	// Add empty body so message gets archived
        payload.c('body').up();
	_connection.send(payload.tree()); // TODO handle error on message submit
    },

};
