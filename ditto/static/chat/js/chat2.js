var Chat = React.createClass({
    getInitialState: function () {
	return {
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
    <Chat />,
    document.getElementById('chat')
);
