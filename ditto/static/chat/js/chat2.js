// TODO add closure (or module, use es6, what version of javascript does jsx compiler support?)?
var composedMessageChangeAt;
var stillTypingTimeout = 5000;

var Chat = React.createClass({
    getInitialState: function () {
	return {
	    connectionStatus: 'connecting',
	    connection: null,
	    friends: [
	    ],
	    messages: [
	    ],
            userMeta: {},
	    whosTyping: {},
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
	    
	    connection.mam.init(connection);
	    connection.mam.query(
		Strophe.getBareJidFromJid(this.props.me),
		{
		    'with': Strophe.getBareJidFromJid(this.props.other),
                    'before': "",
                    'max': 20,
		    onMessage: this.handleArchivedPrivateMessage
		}
	    );

	    connection.roster.init(connection);
	    connection.roster.registerRequestCallback(this.acceptFriendRequest);
	    connection.roster.registerCallback(this.handleRoster);
	    connection.roster.subscribe(Strophe.getBareJidFromJid(this.props.other));
	    connection.roster.get();

            connection.vcard.init(connection);
	    this.getUserMeta(Strophe.getBareJidFromJid(this.props.me));

	    connection.chatstates.init(connection);

	}
	this.state.connectionStatus = status;
        // TODO not sure connection is really state
	this.state.connection = connection;
	this.setState(this.state);
    },
    handleArchivedPrivateMessage: function (msg) {
        var msg = $(msg);
        var body = msg.find("body:first").text();
        var from = Strophe.getNodeFromJid(msg.find('message').attr("from"));
        var to = Strophe.getNodeFromJid(msg.find('message').attr("to"));
        var when = new Date(msg.find('delay').attr('stamp'));
	this.addMessage(
	    from,
	    to,
	    when,
	    body
	);
	return true;
    },
    handlePrivateMessage: function (msg) {
	var msg = $(msg);
	var body = msg.find("body:first").text();
        var from = Strophe.getNodeFromJid(msg.attr("from"));
        var to = Strophe.getNodeFromJid(msg.attr("to"));
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
	    this.addMessage(
		from,
		to,
		when,
		body
	    );
	}
	return true;
    },
    handleMessageSubmit: function (message) {
	var payload = $msg({
	    to: this.props.other,
	    from: this.props.me,
	    type: 'chat'
	}).c('body').t(message);

	this.state.connection.chatstates.addActive(payload);
	composedMessageChangeAt = null;

	this.state.connection.send(payload.tree());
	
	// TODO functions have kwargs in es6?
	// TODO handle error on message submit
	this.addMessage(
	    Strophe.getNodeFromJid(this.props.me),
	    Strophe.getNodeFromJid(this.props.other),
	    new Date(),
	    message
	);
    },
    handleMessageChange: function () {
	if (!composedMessageChangeAt) {
	    this.state.connection.chatstates.sendComposing(
		Strophe.getBareJidFromJid(this.props.other)
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
		    Strophe.getBareJidFromJid(this.props.other)
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
                username = Strophe.getNodeFromJid(friend.jid);
                friends.push(username);
		self.getUserMeta(Strophe.getBareJidFromJid(friend.jid));
            }
        });
        this.state.friends = friends;
        this.setState(this.state);
        return true;  // always bloody forget this!
    },
    getUserMeta: function (jid) {
	var user = Strophe.getNodeFromJid(jid);
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
	    jid
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
   	    <Friends friends={this.state.friends} />
	    <WhosTyping users={this.state.whosTyping} />
	    <Messages messages={this.state.messages} userMeta={this.state.userMeta} />
	    </div>
        );
    }
});

var Friends = React.createClass({
    render: function () {
	var friendNodes = this.props.friends.map(function(friend, index) {
	    return (
		<Friend friend={friend} key={index} />
	    );
	});
	return (
	    <div>
	        <p>Friends</p>
                {friendNodes}
	    </div>
	);
    }
});

var Friend = React.createClass({
    render: function () {
	// TODO switch chats without page load
	var url = '../' + this.props.friend + '/';
	return (
	    <p><a href={url}>{this.props.friend}</a></p>
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
	var messageNodes = this.props.messages.map(function(m, i) {
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
	var meta = this.props.userMeta[this.props.from];
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
        setInterval(this.updateDelta, 60 * 1000);
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
	this.refs.message.getDOMNode().value = '';
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
    <Chat server={chatConf.server} me={chatConf.me} password={chatConf.password} other={chatConf.other} log />,
    document.getElementById('chat')
);
