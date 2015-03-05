var Chat = React.createClass({
    getInitialState: function () {
	return {
	    connectionStatus: 'connecting',
	    connection: null,
	    friends: [
	    ],
	    messages: [
	    ]
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
	    
	    // TODO race condition here? we're about to set a new state, but receving archived messages will update state too
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
            
	}
	this.state.connectionStatus = status;
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
    handleMessageSubmit: function (message) {
	var payload = $msg({
	    to: this.props.other,
	    from: this.props.me,
	    type: 'chat'
	}).c('body').t(message);
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
    acceptFriendRequest: function (from) {
        connection.roster.authorize(from);
        return true;
    },
    handleRoster: function (roster, item) {
        var friends = [];
        $.each(roster, function (i, friend) {
            if (friend.subscription === 'both') {
                username = Strophe.getNodeFromJid(friend.jid);
                friends.push(username);
            }
        });
        this.state.friends = friends;
        this.setState(this.state);
        return true;  // always bloody forget this!
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
	        <ComposeMessage onMessageSubmit={this.handleMessageSubmit} />
   	        <Friends friends={this.state.friends} />
	        <Messages messages={this.state.messages} />
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
	var messageNodes = this.props.messages.map(function(m, i) {
	    return (
		<Message from={m.from} to={m.to} message={m.message} when={m.when} key={i} />
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
	return (
	    <div>
	    <p>{this.props.from} -> {this.props.to} (<Timestamp when={this.props.when}/>): {this.props.message}</p>
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
            <input type="text" placeholder="Type your message here..." ref="message" />
            <input type="submit" value="Say it!" />
	    </form>
	);
    }
});

React.render(
        <Chat server={chatConf.server} me={chatConf.me} password={chatConf.password} other={chatConf.other} />,
    document.getElementById('chat')
);
