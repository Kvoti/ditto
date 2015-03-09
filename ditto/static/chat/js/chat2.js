// TODO add closure (or module, use es6, what version of javascript does jsx compiler support?)?
var composedMessageChangeAt;
var stillTypingTimeout = 5000;
var chatStatus = {
    away: 'Away',
    chat: 'Free for chat',
    dnd: 'Do not disturb',
    xa: 'Extended away',
};
var update = React.addons.update;

var Chat = React.createClass({
    getInitialState: function () {
	return {
	    connectionStatus: 'connecting',
	    connection: null,
	    talkingTo: this.props.other,
	    friends: [
	    ],
	    friendStatus: {},
	    messages: [
	    ],
            userMeta: {},
	    whosTyping: {},
	    isInChatroom: false,
	};
    },
    componentDidMount: function() {
	this.connectToChatServer();
    },
    connectToChatServer: function () {
	connection = new Strophe.Connection('ws://' + this.props.server + ':5280/ws-xmpp');
	if (this.props.hasOwnProperty('log')) {
	    connection.rawInput = function (data) { console.log('RECV: ', data); }
	    connection.rawOutput = function (data) { console.log('RECV: ', data); }
	}
	var self = this;  // TODO better way these days?
	connection.connect(
	    this.props.me,
	    this.props.password,
	    function (status) { self.onConnect(connection, status) }
	);
    },
    onConnect: function (connection, status_code) {
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

	    connection.send($pres().tree());
	    connection.addHandler(this.handlePrivateMessage, null, 'message', 'chat',  null);
 	    connection.addHandler(this.handlePresence, null, 'presence', 'chat',  null); 
	    
	    connection.mam.init(connection);
	    connection.mam.query(
		Strophe.getBareJidFromJid(this.props.me),
		{
		    // TODO load last N messages for each chat not across all chats
		    // 'with': Strophe.getBareJidFromJid(this.state.talkingTo),
                    'before': "",
                    'max': 50,
		    onMessage: this.handleArchivedPrivateMessage
		}
	    );

	    connection.roster.init(connection);
	    connection.roster.registerRequestCallback(this.acceptFriendRequest);
	    connection.roster.registerCallback(this.handleRoster);
	    connection.roster.subscribe(Strophe.getBareJidFromJid(this.state.talkingTo));
	    connection.roster.get();

            connection.vcard.init(connection);
	    this.getUserMeta(Strophe.getBareJidFromJid(this.props.me));

	    connection.chatstates.init(connection);

	    connection.muc.init(connection);
	    connection.muc.join(this.props.chatroom, this.props.nick, this.handleGroupMessage);

	}
	this.state.connectionStatus = status;
        // TODO not sure connection is really state
	this.state.connection = connection;
	this.setState(this.state);
    },
    switchChat: function (friend) {
	this.setState({
	    isInChatroom: false,
	    talkingTo: friend,
	});
    },
    showChatroom: function (e) {
	e.preventDefault();
	this.setState({
	    isInChatroom: true,
	    talkingTo: this.props.chatroom
	});
    },
    handlePresence: function (pres) {
	var msg = $(pres);
	var from = Strophe.getBareJidFromJid(msg.attr('from'));
	var type = msg.attr('type');
	var code;
	var customMessage;
	var newState;
	var status;

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
	var xx = {};
	xx[from]= {$set: status };
	this.setState(
	    update(
		this.state,
		{friendStatus: xx}
	    )
	);
	return true;
    },
    handleArchivedPrivateMessage: function (msg) {
        var msg = $(msg);
	if (msg.find('[type=groupchat]').length === 0) {
            var body = msg.find("body:first").text();
            var from = msg.find('message').attr("from");
            var to = msg.find('message').attr("to");
            var when = new Date(msg.find('delay').attr('stamp'));
	    this.addMessage(
		from,
		to,
		when,
		body
	    );
	}
	return true;
    },
    handlePrivateMessage: function (msg) {
	var msg = $(msg);
	var body = msg.find("body:first").text();
        var from = msg.attr("from");
        var to = msg.attr("to");
	var when = new Date();
	var composing = msg.find('composing');
	var active = msg.find('active');

	if (composing.length) {
	    this.state.whosTyping[from] = true;
	    this.setState(this.state);
	} else {
	    if (active.length) {
		delete this.state.whosTyping[from];
		this.setState(this.state);
	    }
            if (this.isPageHidden()) {
                this.notifyNewMessage(body);
            }
	    this.addMessage(
		from,
		to,
		when,
		body
	    );
	}
	return true;
    },
    isPageHidden: function () {
        // TODO keep this kind of things to existing polyfills (loaded with modernizr?)?
	return document.hidden || document.webkitHidden || document.mozHidden || document.msHidden;
    },
    notifyNewMessage: function (msg) {
        document.getElementById('new-message-beep').play();
	var notification = new Notification("New message", {
	    icon : "/static/images/ditto-logo.png",
            body: msg.slice(0, 140)
	});
        // TODO this is supposed to go to the right tab in chrome but doesn't seem to work
	notification.onclick = function () {
            window.focus();
        };
    },
    handleGroupMessage: function (msg) {
        var msg = $(msg);
        var body = msg.find("body:first").text();
        var from = msg.attr("from") ;//.split('/')[1];
        var when = msg.find('delay');
        if (when.length) {
            when = new Date(when.attr('stamp'));
        } else {
            when = new Date();
        }
        if (from) {
            // TODO always get an 'empty' message from the room
            // itself, not sure why
	    this.addMessage(
		from,
		this.props.me,
		when,
		body
	    )
        }
        return true;
    },
    handleMessageSubmit: function (message) {
	if (this.state.isInChatroom) {
	    this.state.connection.muc.groupchat(this.props.chatroom, message);
	} else {
	    var payload = $msg({
		to: this.state.talkingTo,
		from: this.props.me,
		type: 'chat'
	    }).c('body').t(message);
	    
	    this.state.connection.chatstates.addActive(payload);
	    composedMessageChangeAt = null;
		    
	    this.state.connection.send(payload.tree());
	    // TODO functions have kwargs in es6?
	    // TODO handle error on message submit
	    this.addMessage(
		Strophe.getBareJidFromJid(this.props.me),
		this.state.talkingTo,
		new Date(),
		message
	    );
	}
    },
    handleMessageChange: function () {
	if (!composedMessageChangeAt) {
	    this.state.connection.chatstates.sendComposing(
		Strophe.getBareJidFromJid(this.state.talkingTo)
	    );
	    composedMessageChangeAt = new Date();
	    setTimeout(this.checkImStillTyping, stillTypingTimeout);
	}
    },
    checkImStillTyping: function () {
	if (composedMessageChangeAt) {
	    var now = new Date();
	    if (now - composedMessageChangeAt > stillTypingTimeout) {
		composedMessageChangeAt = undefined;
		connection.chatstates.sendActive(
		    Strophe.getBareJidFromJid(this.state.talkingTo)
		);
	    } else {
		window.setTimeout(this.checkImStillTyping, stillTypingTimeout);
	    }
	}
    },
    acceptFriendRequest: function (from) {
        connection.roster.authorize(from);
        return true;
    },
    handleRoster: function (roster, item) {
        var friends = [];
	var self = this;
        $.each(roster, function (i, friend) {
            if (friend.subscription === 'both') {
                friends.push(friend.jid);
		self.getUserMeta(Strophe.getBareJidFromJid(friend.jid));
            }
        });
        this.state.friends = friends;
        this.setState(this.state);
        return true;  // always bloody forget this!
    },
    getUserMeta: function (user) {
        if (this.state.userMeta[user]) {
            return;
        }
        var self = this;
        this.state.connection.vcard.get(
            function (vcard) {
                vcard = $(vcard);
                var role = vcard.find('ROLE').text();
                var avatar = vcard.find('PHOTO').text();
                self.state.userMeta[user] = {role: role, avatar: avatar};
		self.setState(self.state);
            },
	    user
        );
    },
    addMessage: function (from, to, when, message) {
	this.state.messages.push(
	{
	    from: from,
	    to: to,
	    when: when,
	    message: message
	});
	this.setState(this.state);
    },
    render: function () {
	if (this.state.connectionStatus !== 'connected') {
	    return (
		<div>
		{this.state.connectionStatus}
		</div>
	    );
	}
        return (
	    <div>
	    <ComposeMessage onMessageSubmit={this.handleMessageSubmit} onMessageChange={this.handleMessageChange} />
            <MyStatus />
		<Friends friends={this.state.friends} friendStatus={this.state.friendStatus} current={this.state.talkingTo} switchChat={this.switchChat} />
	    <Chatroom show={this.showChatroom} isInside={this.state.isInChatroom} />
	    <WhosTyping users={this.state.whosTyping} />
	    <Messages talkingTo={this.state.talkingTo} messages={this.state.messages} userMeta={this.state.userMeta} />
	    </div>
        );
    }
});

var MyStatus = React.createClass({
    render: function () {
	return (
	    <div>My status goes here</div>
	);
    }
});

var Friends = React.createClass({
    render: function () {
	var self = this;
	var friendNodes = this.props.friends.map(function(friend, index) {
	    var is_current = self.props.current === friend;
	    var status = self.props.friendStatus[friend];
	    return (
		    <Friend is_current={is_current} friend={friend} status={status} key={index} switchChat={self.props.switchChat} />
	    );
	});
	return (
	    <div>
                {friendNodes}
	    </div>
	);
    }
});

var Friend = React.createClass({
    switchChat: function (e) {
	e.preventDefault();
	this.props.switchChat(this.props.friend);
    },
    render: function () {
	var current, status = '';
	if (this.props.is_current) {
	    current = (
		<span> * </span>
	    );
	}
	if (this.props.status && this.props.status.hasOwnProperty('code')) {
	    status = <FriendStatus code={this.props.status.code} message={this.props.status.message} />;
	} else {
	    status = <p>Offline</p>;
	}
	return (
	    <div>
		<p>{current} <a href="#" onClick={this.switchChat}>{this.props.friend}</a></p>
		{status}
	    </div>
	);
    }
});

var FriendStatus = React.createClass({
    render: function () {
	var status = chatStatus[this.props.code] || 'Online';
	return (
	    <p>{status} <em>{this.props.message}</em></p>
	);
    }
});
	   

var Chatroom = React.createClass({
    render: function () {
	var current;
	if (this.props.isInside) {
	    current = (
		<span> * </span>
	    );
	}
	return (
	    <div>
	    {current} <a onClick={this.props.show} href="#">Chatroom</a>
	    </div>
	);
    }
});

var Messages = React.createClass({
    componentDidUpdate: function() {
	var node = this.getDOMNode();
	node.scrollTop = node.scrollHeight;
    },
    render: function () {
	var userMeta = this.props.userMeta;
	var self = this;
	var messages = this.props.messages.filter(
	    function (msg) {
		return Strophe.getBareJidFromJid(msg.from) === self.props.talkingTo || Strophe.getBareJidFromJid(msg.to) === self.props.talkingTo
	    }
	);
	var messageNodes = messages.map(function(m, i) {
	    return (
		<Message from={m.from} to={m.to} message={m.message} when={m.when} userMeta={userMeta} key={i} />
	    );
	});
	return (
	    <div className="messages">
                {messageNodes}
	    </div>
	);
    }
});

var Message = React.createClass({
    render: function () {
	var avatar;
	var meta = this.props.userMeta[Strophe.getBareJidFromJid(this.props.from)];
	if (meta) {
	    avatar = meta.avatar;
	} else {
	    avatar = 'cupcake'
	}
	return (
	    <div>
	    <Avatar size={50} user={this.props.from} name={avatar} /> (<Timestamp when={this.props.when}/>): {this.props.message}
            </div>
	);
    }
});

var WhosTyping = React.createClass({
    render: function () {
	var nodes = [];
	for (var user in this.props.users) {
	    nodes.push(
		<p>{user} is typing ...</p>
	    );
	};
	return (
	    <div>{nodes}</div>
	);
    }
});

var Avatar = React.createClass({
    render: function () {
	// TODO where to put global constant state like this?
	var avatarSVGs = $('#avatar_svgs').text();

	// TODO better way to generate svg without jquery/outerHTML, convert svg to react component?
        var avatarSVG = $(avatarSVGs);
	var avatarName = this.props.name;
	if (avatarName) {
            avatarSVG.find('>g[id!=' + avatarName + ']').remove();
            avatarSVG.find('>g').show();
            avatarSVG.attr({
		width: this.props.size,
		height: this.props.size
            });
	    avatarSVG = avatarSVG.get(0).outerHTML;
	} else {
	    avatarSVG = '';
	}
	return (
	    <div>
  	    <span>{this.props.user}</span>
            <div dangerouslySetInnerHTML={{__html: avatarSVG}} />
	    </div>
	);
    }
});

var Timestamp = React.createClass({
    componentDidMount: function() {
        this.interval = setInterval(this.updateDelta, 60 * 1000);
    },
    componentWillUnmount: function () {
	clearInterval(this.interval);
    },
    updateDelta: function () {
        // TODO this doesn't feel right
        this.setState({});
    },
    // TODO prob library for this
    timeAgo: function (date) {
        var delta = new Date() - date;
        if (delta < 60000) {
            return 'less than a minute ago';
        }
        if (delta < 3600 * 1000) {
            var minutes = delta / (60 * 1000);
            return Math.floor(minutes) + ' minutes ago';
        }
        if (delta < 2 * 3600 * 1000) {
            return 'about an hour ago';
        }
        return 'ages ago';
    },
    render: function () {
        when = this.props.when;
        var delta = this.timeAgo(when);
        return (
                <time dateTime={when.toISOString()}>{delta}</time>
        );
    }
});
                               
var ComposeMessage = React.createClass({
    getInitialState: function() {
	return {value: ''};
    },
    handleChange: function(event) {
	this.setState({value: event.target.value});
	this.props.onMessageChange();
    },
    handleSubmit: function(e) {
	e.preventDefault();
	var message = this.refs.message.getDOMNode().value.trim();
	if (!message) {
	    return;
	}
	this.props.onMessageSubmit(message);
	this.setState({value: ''});
	return;
    },
    render: function() {
	return (
	    <form onSubmit={this.handleSubmit}>
            <input value={this.state.value} onChange={this.handleChange} type="text" placeholder="Type your message here..." ref="message" />
            <input type="submit" value="Say it!" />
	    </form>
	);
    }
});

React.render(
    <Chat server={chatConf.server} me={chatConf.me} password={chatConf.password} other={chatConf.other} chatroom={chatConf.chatroom} nick={chatConf.nick} />,
    document.getElementById('chat')
);
