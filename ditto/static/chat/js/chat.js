// This is me attempting flux from a quick reading of the todomvc
// example.  We abstract out the chat state into another object that
// has methods for getting/setting the state, and the ability to
// register handlers to call when the state changes. Like this,
// independant react classes can repsond to the same chat state.  The
// flux example uses proper Store, Action, Dispatcher objects. I'll
// get there eventually...

var connection, jid, chatroom, nick;
var change_callbacks = [];
var chatStatus = {
    away: 'Away',
    chat: 'Free for chat',
    dnd: 'Do not disturb',
    xa: 'Extended away',
};
var composedMessageChangeAt = {};
var stillTypingTimeout = 5000;

var state = {
    connectionStatus: 'connecting',
    friends: [
    ],
    friendStatus: {},
    messages: [
    ],
    chatroomMessages: [
	
    ],
    userMeta: {},
    whosTyping: [],
    chatroomPresence: [],
};

// Chat public API ----------------------------------
function connect (server, _jid, password, _chatroom, _nick, log=false) {
    jid = _jid;
    chatroom = _chatroom;
    nick = _nick;
    connection = new Strophe.Connection('ws://' + server + ':5280/ws-xmpp');
    if (log) {
        setupLogging();
    }
    connection.connect(
        jid,
	password,
        onConnect
    );
};

function getState () {
    return state;
}

function whosOnline () {
    return {'online': state.chatroomPresence};
}

function getUserProfiles () {
    return {'profiles': state.userMeta};
}

function setStatus (code, message) {
    var pres = $pres();
    if (code) {
	pres.c('show').t(code).up();
    }
    if (message) {
	pres.c('status').t(message);
    }
    connection.send(pres.tree());
};

function sendGroupMessage (message) {
    connection.muc.groupchat(chatroom, message);
}

function sendPrivateMessage (to, message) {
    var payload = $msg({
	to: getBareJID(to),
	from: jid,
	type: 'chat'
    }).c('body').t(message);
    connection.chatstates.addActive(payload);
    delete composedMessageChangeAt[to];
    connection.send(payload.tree());
    // TODO handle error on message submit
    addMessage(
	Strophe.getNodeFromJid(jid),
        to,
	new Date(),
	message
    );
};

function sendIsTyping (to) {
    if (!composedMessageChangeAt[to]) {
	connection.chatstates.sendComposing(
	    getBareJID(to)
	);
	composedMessageChangeAt[to] = new Date();
	setTimeout(() => {checkImStillTyping(to)}, stillTypingTimeout);
    }
}
// --------------------------------------------------

// TODO flux example does a lot more complicated things with callbacks
function addChangeListener (callback) {
    change_callbacks.push(callback);
};

function removeChangeListener (callback) {
    change_callbacks.splice(change_callbacks.indexOf(callback), 1);
};

function emitChange () {
    change_callbacks.forEach(callback => callback());
};

function setupLogging () {
    connection.rawInput = function (data) { console.log('RECV: ', data); };
    connection.rawOutput = function (data) { console.log('RECV: ', data); };
};

function onConnect (status_code) {
    if (status_code == Strophe.Status.CONNECTED) {
        sendInitialPresence();
        configurePrivateChat();
	loadArchivedMessages();
        configureFriends();
        configureUserMeta();
        connection.chatstates.init(connection);
        joinChatroom();
    }
    setConnectionStatus(status_code);
};

function sendInitialPresence () {
    connection.send($pres().tree());
};

function configurePrivateChat () {
    connection.addHandler(handlePrivateMessage, null, 'message', 'chat',  null);
    connection.addHandler(handlePresence, null, 'presence', null,  null); 
};

function loadArchivedMessages () {
    connection.mam.init(connection);
    connection.mam.query(
        Strophe.getBareJidFromJid(jid),
        {
            // TODO load last N messages for each chat not across all chats
            // 'with': Strophe.getBareJidFromJid(this.state.talkingTo),
            'before': "",
            'max': 50,
            onMessage: handleArchivedPrivateMessage
        }
    );
};

function configureFriends () {
    connection.roster.init(connection);
    connection.roster.registerRequestCallback(acceptFriendRequest);
    connection.roster.registerCallback(handleRoster);
    connection.roster.get();
};

function configureUserMeta () {
    connection.vcard.init(connection);
    getUserMeta(Strophe.getNodeFromJid(jid));
};

function joinChatroom () {
    connection.muc.init(connection);
    connection.muc.join(
        chatroom,
        nick,
        handleGroupMessage,
        handleGroupPresence
    );
};

function setConnectionStatus (status_code) {
    var status;
    if (status_code == Strophe.Status.CONNECTING) {
	status = 'connecting';
    } else if (status_code == Strophe.Status.CONNFAIL) {
	status = 'failed to connect';
    } else if (status_code == Strophe.Status.DISCONNECTING) {
	status = 'disconnecting';
    } else if (status_code == Strophe.Status.DISCONNECTED) {
	status = 'disconnected';
    } else if (status_code == Strophe.Status.CONNECTED) {
	status = 'connected';
    }
    state.connectionStatus = status;
    emitChange();
};

function addFriend (friend) {
    connection.roster.subscribe(getBareJID(jid));
};

var handlePresence = function (pres) {
    var msg = $(pres);
    var from = Strophe.getNodeFromJid(msg.attr('from'));
    var type = msg.attr('type');
    var code;
    var customMessage;
    var newState;
    var status;
    var friendStatus = {};

    if (type === 'unavailable') {
	status = {};
    } else {
	code = msg.find('show').text();
	customMessage = msg.find('status').text();
	status = {
	    code: code,
	    message: customMessage
	};
    }
    state.friendStatus[from] = status;
    emitChange();
    return true;
};

var handlePrivateMessage = function (msg) {
    var msg = $(msg);
    var body = msg.find("body:first").text();
    var from = Strophe.getNodeFromJid(msg.attr("from"));
    var to = Strophe.getNodeFromJid(msg.attr("to"));
    var when = new Date();
    var composing = msg.find('composing');
    var active = msg.find('active');
    var newState;
    
    if (composing.length) {
        state.whosTyping.push(from);
        emitChange();
    } else {
	if (active.length) {
	    state.whosTyping.splice(state.whosTyping.indexOf(from), 1);
	}
	if (body) {
            // TODO don't know where this belongs now
	    // if (this.props.page !== 'messages' || this.isPageHidden()) {
	    //     this.notifyNewMessage(body);
	    // }
	    addMessage(
		from,
		to,
		when,
		body
	    );
	}
    }
    return true;
};

var handleArchivedPrivateMessage = function (msg) {
    var msg = $(msg);
    if (msg.find('[type=groupchat]').length === 0) {
	var body = msg.find("body:first").text();
	var from = Strophe.getNodeFromJid(msg.find('message').attr("from"));
	var to = Strophe.getNodeFromJid(msg.find('message').attr("to"));
	var when = new Date(msg.find('delay').attr('stamp'));
        // TODO could be smarter here and only emitChange() when the archive has all been loaded?
	addMessage(
	    from,
	    to,
	    when,
	    body
	);
    }
    return true;
};

var handleGroupMessage = function (msg) {
    var msg = $(msg);
    var body = msg.find("body:first").text();
    var from = Strophe.getResourceFromJid(msg.attr("from"));
    var when = msg.find('delay');
    if (when.length) {
	when = new Date(when.attr('stamp'));
    } else {
	when = new Date();
    }
    if (from) {
	// TODO always get an 'empty' message from the room
	// itself, not sure why
	addGroupMessage(
	    from,
	    when,
	    body
	);
    }
    return true;
};

var handleGroupPresence = function (pres) {
    var msg = $(pres);
    var nick_taken = msg.find('conflict');
    var from = msg.attr('from').split('/')[1];
    var newState;
    if (nick_taken.length) {
	// TODO do something with this
    }
    var added = msg.find('item[role!=none]');
    if (added.length) {
        state.chatroomPresence.push(from);
    }
    var removed = msg.find('item[role=none]');
    if (removed.length) {
        state.chatroomPresence.splice(state.chatroomPresence.indexOf(from), 1);
    }
    // First time we enter the chatroom for a new network the room
    // needs to be created and configured
    var isNewRoom = msg.find('status[code=201]');
    if (isNewRoom.length) {
        // TODO handle failure
        connection.muc.createInstantRoom(chatroom);
    }
    emitChange();
    return true;
};

function getBareJID (node) {
    var domain = Strophe.getDomainFromJid(chatConf.me);
    return node + '@' + domain;
};

var addMessage = function (from, to, when, message) {
    state.messages.push({
	from: from,
	to: to,
	when: when,
	message: message
    });
    emitChange();
};

function addGroupMessage (from, when, message) {
    state.chatroomMessages.push(
	{
	    from: from,
	    when: when,
	    message: message
	}
    );
    emitChange();
}

function acceptFriendRequest (from) {
    connection.roster.authorize(from);
    return true;
}

function handleRoster (roster, item) {
    var friends = [];
    roster.forEach((friend, i) => {
	var username = Strophe.getNodeFromJid(friend.jid);
	if (friend.subscription === 'both') {
	    friends.push(username);
	    getUserMeta(username);
	}
    });
    state.friends = friends;
    emitChange();
    return true;
}

function checkImStillTyping (to) {
    var lastChange = composedMessageChangeAt[to];
    if (lastChange) {
	var now = new Date();
	if (now - lastChange > stillTypingTimeout) {
	    delete composedMessageChangeAt[to];
	    connection.chatstates.sendActive(
		getBareJID(to)
	    );
	} else {
	    window.setTimeout(() => { checkImStillTyping(to); }, stillTypingTimeout);
	}
    }
}

function getUserMeta (user) {
    var jid = getBareJID(user);
    if (state.userMeta[user]) {
	return;
    }
    connection.vcard.get(
	vcard => {
	    vcard = $(vcard);
	    var setUserMeta = {};
	    var newState;
	    var role = vcard.find('ROLE').text();
	    var avatar = vcard.find('PHOTO').text();
	    state.userMeta[user] = {role: role, avatar: avatar};
            emitChange();
	},
	jid
    );
};

export {
    connect, getState, addChangeListener, removeChangeListener,
    whosOnline, getUserProfiles,
    chatStatus, setStatus,
    addFriend,
    sendPrivateMessage, sendGroupMessage, sendIsTyping,
};
