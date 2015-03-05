var Chat = React.createClass({
    getInitialState: function () {
	return {
	    connectionStatus: 'connecting',
	    connection: null,
	    me: 'mark',
	    other: 'sarah',
	    friends: [
		'admin',
		'sarah',
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
	    this.state.me,
	    this.state.other,
	    new Date(),
	    message
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
	return (
	    <p>{this.props.friend}</p>
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
		<Message from={m.from} to={m.to} message={m.message} when={m.when.toISOString()} key={i} />
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
	    <p>{this.props.from} -> {this.props.to} ({this.props.when}): {this.props.message}</p>
            </div>
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
    <Chat server="localhost" me="mark@network1.localhost/Ditto" password="" other="sarah@network1.localhost/Ditto" />,
    document.getElementById('chat')
);
