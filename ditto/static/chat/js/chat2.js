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
		{
		    'from': 'mark',
		    'to': 'sarah',
		    'msg': 'hey there!'
		},
		{
		    'from': 'sarah',
		    'to': 'mark',
		    'msg': "React.js is frikkin' cool"
		},
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
	    this.props.jid,
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
	}
	this.state.connectionStatus = status;
	this.state.connection = this.connection;
	this.setState(this.state);
    },
    handleMessageSubmit: function (message) {
	this.state.messages.push(
	{
	    from: this.state.me,
	    to: this.state.other,
	    msg: message
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
    render: function () {
	var messageNodes = this.props.messages.map(function(m, i) {
	    return (
		<Message from={m.from} to={m.to} message={m.msg} key={i} />
	    );
	});
	return (
	    <div>
	        <p>Messages</p>
                {messageNodes}
	    </div>
	);
    }
});

var Message = React.createClass({
    render: function () {
	return (
	    <div>
	    <p>{this.props.from} -> {this.props.to}: {this.props.message}</p>
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
	this.props.onMessageSubmit({message: message});
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
    <Chat server="localhost" jid="mark@network1.localhost" password="" />,
    document.getElementById('chat')
);
