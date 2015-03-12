// This is me attempting flux from a quick reading of the todomvc
// example.  We abstract out the chat state into another object that
// has methods for getting/setting the state, and the ability to
// register handlers to call when the state changes. Like this,
// independant react classes can repsond to the same chat state.  The
// flux example uses proper Store, Action, Dispatcher objects. I'll
// get there eventually...

var connection;
var change_callbacks = [];
var state = {
    connectionStatus: 'connecting',
    talkingTo: null,  // TODO
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

function getState () {
    return state;
};

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

function connect (server, jid, password, log=false) {
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

function setupLogging () {
    connection.rawInput = function (data) { console.log('RECV: ', data); };
    connection.rawOutput = function (data) { console.log('RECV: ', data); };
};

function onConnect (status_code) {
    if (status_code == Strophe.Status.CONNECTED) {
	connection.send($pres().tree());
	// connection.addHandler(this.handlePrivateMessage, null, 'message', 'chat',  null);
	// connection.addHandler(this.handlePresence, null, 'presence', null,  null); 
	
    //     connection.mam.init(connection);
    //     connection.mam.query(
    //         Strophe.getBareJidFromJid(this.props.me),
    //         {
    //     	// TODO load last N messages for each chat not across all chats
    //     	// 'with': Strophe.getBareJidFromJid(this.state.talkingTo),
    //     	'before': "",
    //     	'max': 50,
    //     	onMessage: this.handleArchivedPrivateMessage
    //         }
    //     );

    //     connection.roster.init(connection);
    //     connection.roster.registerRequestCallback(this.acceptFriendRequest);
    //     connection.roster.registerCallback(this.handleRoster);
    //     connection.roster.subscribe(this.getBareJID(this.state.talkingTo));
    //     connection.roster.get();

    //     connection.vcard.init(connection);
    //     this.getUserMeta(Strophe.getNodeFromJid(this.props.me));

    //     connection.chatstates.init(connection);

    //     connection.muc.init(connection);
    //     connection.muc.join(
    //         this.props.chatroom,
    //         this.props.nick,
    //         this.handleGroupMessage,
    //         this.handleGroupPresence
    //     );
    }
    setConnectionStatus(status_code);
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

export { getState, addChangeListener, removeChangeListener, connect };
