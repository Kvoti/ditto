import React from 'react';
// TODO prob only load components we need?
import * as Bootstrap from "vendor/react-bootstrap/index";  // TODO shouldn't this work without /index?

var connection;
var composedMessageChangeAt;
var stillTypingTimeout = 5000;
var chatStatus = {
    away: 'Away',
    chat: 'Free for chat',
    dnd: 'Do not disturb',
    xa: 'Extended away',
};
var update = React.addons.update;
var classSet = React.addons.classSet;

var getMessages = function (messages, other) {
    return messages.filter(
	function (msg) {
	    return msg.from === other || msg.to === other;
	}
    );
};

var Chat = React.createClass({
    getInitialState: function () {
	return {
	    connectionStatus: 'connecting',
	    talkingTo: Strophe.getNodeFromJid(this.props.other || ''),
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
    },
    getBareJID: function (node) {
	var domain = Strophe.getDomainFromJid(this.props.me);
	return node + '@' + domain
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
	    connection.addHandler(this.handlePresence, null, 'presence', null,  null); 
	    
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
	    connection.roster.subscribe(this.getBareJID(this.state.talkingTo));
	    connection.roster.get();

	    connection.vcard.init(connection);
	    this.getUserMeta(Strophe.getNodeFromJid(this.props.me));

	    connection.chatstates.init(connection);

	    connection.muc.init(connection);
	    connection.muc.join(
		this.props.chatroom,
		this.props.nick,
		this.handleGroupMessage,
		this.handleGroupPresence
	    );

	}
	this.setState({connectionStatus: status});
    },
    switchChat: function (friend) {
	this.setState({
	    talkingTo: friend,
	});
    },
    handlePresence: function (pres) {
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
	friendStatus[from] = {$set: status};
	this.setState(
	    update(
		this.state,
		{friendStatus: friendStatus}
	    )
	);
	return true;
    },
    setMyStatus: function (code, message) {
	console.log('setting status', code, message);
	var pres = $pres();
	if (code) {
	    pres.c('show').t(code).up();
	}
	if (message) {
	    pres.c('status').t(message);
	}
	connection.send(pres.tree());
    },
    handleArchivedPrivateMessage: function (msg) {
	var msg = $(msg);
	if (msg.find('[type=groupchat]').length === 0) {
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
	}
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
	var newState;
	
	if (composing.length) {
	    newState = update(this.state, {whosTyping: {$push: [from]}});
	    this.setState(newState);
	} else {
	    if (active.length) {
		newState = update(this.state, {whosTyping: {$splice: [[this.state.whosTyping.indexOf(from), 1]]}});
		this.setState(newState);
	    }
	    if (body) {
		if (this.props.page !== 'messages' || this.isPageHidden()) {
		    this.notifyNewMessage(body);
		}
		this.addMessage(
		    from,
		    to,
		    when,
		    body
		);
	    }
	}
	return true;
    },
    isPageHidden: function () {
	// TODO keep this kind of things to existing polyfills (loaded with modernizr?)?
	return document.hidden || document.webkitHidden || document.mozHidden || document.msHidden;
    },
    notifyNewMessage: function (msg) {
	console.log('playing beep');
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
	    this.addGroupMessage(
		from,
		when,
		body
	    )
	}
	return true;
    },
    handleGroupPresence: function (pres) {
	var msg = $(pres);
	var nick_taken = msg.find('conflict');
        var from = msg.attr('from').split('/')[1];
	var newState;
	if (nick_taken.length) {
	    // TODO do something with this
	}
	var added = msg.find('item[role!=none]');
	if (added.length) {
	    newState = update(this.state, {chatroomPresence: {$splice: [[0, 0, from]]}});
	}
	var removed = msg.find('item[role=none]');
	if (removed.length) {
	    newState = update(this.state, {chatroomPresence: {$splice: [[this.state.chatroomPresence.indexOf(from), 1]]}});
	}
        // First time we enter the chatroom for a new network the room
        // needs to be created and configured
        var is_new_room = msg.find('status[code=201]');
        if (is_new_room.length) {
            // TODO handle failure
            connection.muc.createInstantRoom(this.props.chatroom);
        }
	this.setState(newState);
	return true;
    },
    handleMessageSubmit: function (message) {
	if (this.props.page === 'chatroom') {
	    connection.muc.groupchat(this.props.chatroom, message);
	} else {
	    var payload = $msg({
		to: this.getBareJID(this.state.talkingTo),
		from: this.props.me,
		type: 'chat'
	    }).c('body').t(message);
	    
	    connection.chatstates.addActive(payload);
	    composedMessageChangeAt = null;
	    
	    connection.send(payload.tree());
	    // TODO functions have kwargs in es6?
	    // TODO handle error on message submit
	    this.addMessage(
		Strophe.getNodeFromJid(this.props.me),
		this.state.talkingTo,
		new Date(),
		message
	    );
	}
    },
    handleMessageChange: function () {
	if (!composedMessageChangeAt) {
	    connection.chatstates.sendComposing(
		this.getBareJID(this.state.talkingTo)
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
		    this.getBareJID(this.state.talkingTo)
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
	var newState;
	var self = this;
	$.each(roster, function (i, friend) {
	    var username = Strophe.getNodeFromJid(friend.jid);
	    if (friend.subscription === 'both') {
		friends.push(username);
		self.getUserMeta(username);
	    }
	});
	newState = update(this.state, {friends: {$set: friends}});
	if (!this.state.talkingTo && friends) {
	    newState = update(newState, {talkingTo: {$set: friends[0]}});
	}
	this.setState(newState);
	return true;  // always bloody forget this!
    },
    getUserMeta: function (user) {
	var jid = this.getBareJID(user);
	if (this.state.userMeta[user]) {
	    return;
	}
	connection.vcard.get(
	    vcard => {
		vcard = $(vcard);
		var setUserMeta = {};
		var newState;
		var role = vcard.find('ROLE').text();
		var avatar = vcard.find('PHOTO').text();
		setUserMeta[user] = {$set: {role: role, avatar: avatar}};
		newState = update(this.state, {userMeta: setUserMeta})
		this.setState(newState);
	    },
	    jid
	);
    },
    addMessage: function (from, to, when, message) {
	var newState;
	newState = update(this.state,
	    {messages: {
		$push: [{
			from: from,
			to: to,
			when: when,
			message: message
		}]
	    }}
	);
	this.setState(newState);
    },
    addGroupMessage: function (from, when, message) {
	var newState;
	newState = update(this.state,
	    {chatroomMessages: {
		$push: [{
		    from: from,
		    when: when,
		    message: message
		}]
	    }}
	);
	this.setState(newState);
    },
    render: function () {
	var messages;
	if (!this.props.page) {
	    // For now we have some pages with no chat UI elements but
	    // we're still connected to chat so we can, for example, beep
	    // on new messages. TODO maybe that should be separated out
	    // from the react stuff?
	    return <div></div>;
	} else if (this.state.connectionStatus !== 'connected') {
	    return (
		<div>
		    {this.state.connectionStatus}
		</div>
	    );
	} else if (this.props.page === 'chatroom') {
	    return (
		<div className="row">
    		    <div className="col-md-8">
    			<Messages me={Strophe.getNodeFromJid(this.props.me)} talkingTo={this.state.talkingTo} messages={this.state.chatroomMessages} userMeta={this.state.userMeta} />
			<div className="row msgbar">
      			    <ComposeMessage onMessageSubmit={this.handleMessageSubmit} onMessageChange={this.handleMessageChange} />
			</div>
    		    </div>
		    <div className="col-md-4">
			<ChatroomPresence users={this.state.chatroomPresence}/>
		    </div>
		</div>
	    );
	} else if (this.props.page === 'messages') {
	    messages = getMessages(this.state.messages, this.state.talkingTo);
	    return (
    		<div className="row">
    		    <div className="col-md-4">
			<div className="list-group">
    			    <Friends messages={this.state.messages} friends={this.state.friends} friendStatus={this.state.friendStatus} current={this.state.talkingTo} switchChat={this.switchChat} userMeta={this.state.userMeta} />
			</div>
    		    </div>
    		    <div className="col-md-8">
    			<Messages me={Strophe.getNodeFromJid(this.props.me)} talkingTo={this.state.talkingTo} messages={messages} userMeta={this.state.userMeta} />
    			<WhosTyping users={this.state.whosTyping} />
			<div className="row msgbar">
    			    <ComposeMessage onMessageSubmit={this.handleMessageSubmit} onMessageChange={this.handleMessageChange} />
			    <MyStatus setStatus={this.setMyStatus} />
			</div>
    		    </div>
    		</div>
	    );
	} else {
	    return (
		<WhosOnline users={this.state.chatroomPresence} userMeta={this.state.userMeta} />
	    );
	}
    }
});

var WhosOnline = React.createClass({
    usersPerPanel: 9,
    groupUsers: function (users) {
	var grouped = [];
	var group;
	users.forEach((user, i) => {
	    if (i % this.usersPerPanel === 0) {
		group = [];
		grouped.push(group);
	    }
	    group.push(user);
	});
	return grouped;
    },
    render: function () {
	var userMeta = this.props.userMeta;
	var groupedUsers = this.groupUsers(this.props.users);
	var items = groupedUsers.map((group, i) => {
	    return (
		<Bootstrap.CarouselItem key={i}>
		    <WhosOnlineItem users={group} userMeta={this.props.userMeta} key={i} />
		</Bootstrap.CarouselItem>
	    );
	});
	return (
	    <div className="row">
		<div className="col-md-4 whosonline">
		    <Bootstrap.Carousel interval={false}>
			{items}
		    </Bootstrap.Carousel>
		</div>
	    </div>
	);
    }
});

var WhosOnlineItem = React.createClass({
    render: function () {
	var users = this.props.users.map((user, i) => {
	    return (
		<div className="avatar" key={i}>
		    <Avatar size={100} user={user} userMeta={this.props.userMeta} />
		    <p>{user}</p>
		</div>
	    );
	});
	return (
	    <div>
		{users}
	    </div>
	);
    }
});

var ChatroomPresence = React.createClass({
    render: function () {
	var memberNodes = this.props.users.map(function (user) {
	    return (
		<li className="list-group-item" key={user}>
                    <div className="media">
			<div className="media-left media-middle">
			</div>
			<div className="media-body">
                            <h4 className="media-heading">{user}</h4>
			</div>
		    </div>
		</li>
	    );
	});
	return (
            <ul className="list-group">
		{memberNodes}
            </ul>
	);
    }
});
    
var MyStatus = React.createClass({
    getInitialState: function() {
	return {
	    status: '',
	    message: '',
	};
    },
    handleMessageChange: function(event) {
	this.setState({message: event.target.value});
    },
    handleStatusChange: function (e) {
	e.preventDefault();
	var message = this.refs.message.getDOMNode().value.trim();
	var code = this.refs.status.getDOMNode().value;
	this.props.setStatus(code, message);
    },
    render: function () {
	var options = [];
	for (var code in chatStatus) {
	    options.push(<option value={code} key={code}>{chatStatus[code]}</option>);
	}
	return (
	    <form onSubmit={this.handleStatusChange}>
		<div className="col-md-2">
		    <input className="form-control" value={this.state.message} onChange={this.handleMessageChange} type="text" placeholder="Type your custom status message here..." ref="message" />
		</div>
		<div className="col-md-2">
		    <select className="form-control" ref="status">
			<option value="">Online</option>
			{options}
		    </select>
		</div>
		<div className="col-md-1">
		    <input className="form-control btn btn-success" type="submit" value="Set status" />
		</div>
	    </form>
	);
    }
});

var Friends = React.createClass({
    render: function () {
	var self = this;
	var friendNodes = this.props.friends.map(function(friend, index) {
	    var isCurrent = self.props.current === friend;
	    var status = self.props.friendStatus[friend];
	    var lastMessage = getMessages(self.props.messages, friend).pop();
	    return (
		<Friend isCurrent={isCurrent} friend={friend} status={status} lastMessage={lastMessage} key={index} switchChat={self.props.switchChat} userMeta={self.props.userMeta} />
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
	var current, status = '', lastMessage;
	if (this.props.isCurrent) {
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
	    <a className="list-group-item" href="#" onClick={this.switchChat}>
		<div className="media-left media-middle friends-avatar">
		    <Avatar size={50} user={this.props.friend} userMeta={this.props.userMeta} />
		</div>
		<div className="media-body">
		    <h4 className="media-heading friends-username">{current} {this.props.friend}</h4>
		    {status}
		    <LastMessage message={this.props.lastMessage} />
		</div>
	    </a>
	);
    }
});

var LastMessage = React.createClass({
    render: function () {
	if (this.props.message) {
	    return <div>
		{this.props.message.message} <small><Timestamp when={this.props.message.when} /></small>
	    </div>;
	} else {
	    return <div></div>;  // TODO empty component a thing?
	}
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
	    <a className="list-group-item" onClick={this.props.show} href="#">
		{current} Chatroom
	    </a>
	);
    }
});

var Messages = React.createClass({
    getInitialState: function () {
	return {height: ''};
    },
    componentDidMount: function () {
	// TODO window.onresize cross-browser?
	window.onresize = this.updateHeight;
    },
    updateHeight: function () {
	// TODO no pure css way to do this?
	var height = $(window).height()
	    - $('.msgbar').height()
	    - $('.navbar').height()
	    - 2 * parseInt($('.navbar').css('margin-bottom'), 10)  // TODO the 2* here is a fluke, don't know why it works
	    - $('footer').height()
	    - parseInt($('footer').css('margin-bottom'), 10);
	var page_head = $('.page-heading');
	if (page_head.length) {
	    height -= page_head.height() + parseInt(page_head.css('margin-bottom'));
	}
	this.setState({height: height});
    },
    componentWillMount: function () {
	this.updateHeight();
    },
    componentWillUnmount: function () {
	// TODO window.remove event listener
    },
    componentDidUpdate: function() {
	var node = this.getDOMNode();
	node.scrollTop = node.scrollHeight;
    },
    render: function () {
	var userMeta = this.props.userMeta;
	var self = this;
	var messageNodes = this.props.messages.map(function(m, i) {
	    // TODO this key should probably be unique across all messages
	    return (
		<Message me={self.props.me} from={m.from} to={m.to} message={m.message} when={m.when} userMeta={userMeta} key={i} />
	    );
	});
	var style = {height: this.state.height}
	return (
	    <div style={style} id="msgs" ref="messages">
		{messageNodes}
	    </div>
	);
    }
});

var Message = React.createClass({
    render: function () {
	var left_avatar, right_avatar;
	var is_from_me = this.props.from === this.props.me;
	var mediaClass = classSet({
	    'media-left': !is_from_me,
	    'media-right': is_from_me
	});
	var avatar = <div className={mediaClass}>
    		<Avatar size={50} user={this.props.from} userMeta={this.props.userMeta} />
	</div>;
	var colClass = classSet({
	    'col-md-6': true,
	    'col-md-offset-6': is_from_me
	});
	if (is_from_me) {
	    right_avatar = avatar;
	} else {
	    left_avatar = avatar;
	}
	return (
	    <div className="row">
		<div className={colClass}>
		    <div className="media">
			{left_avatar}
			<div className="media-body">
			    <h4 className="media-heading">{this.props.from} <small><Timestamp when={this.props.when}/></small></h4>
			    {this.props.message}
			</div>
			{right_avatar}
		    </div>
		</div>
	    </div>
	);
    }
});

var WhosTyping = React.createClass({
    render: function () {
	var nodes = this.props.users.map((user, i) =>
	    <p key={i}>{user} is typing ...</p>
	);
	return (
	    <div>{nodes}</div>
	);
    }
});

var Avatar = React.createClass({
    render: function () {
	// TODO where to put global constant state like this?
	var avatarSVGs = $('#avatar_svgs').text();
	var avatarName;
	var meta = this.props.userMeta[Strophe.getBareJidFromJid(this.props.user)];
	if (meta) {
	    avatarName = meta.avatar;
	} else {
	    avatarName = 'cupcake'
	}
	// TODO better way to generate svg without jquery/outerHTML, convert svg to react component?
	var avatarSVG = $(avatarSVGs);
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
	var when = this.props.when;
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
		<div className="col-md-6">
		    <input className="form-control" value={this.state.value} onChange={this.handleChange} type="text" placeholder="Type your message here..." ref="message" />
		</div>
		<div className="col-md-1">
		    <input className="btn btn-success" type="submit" value="Say it!" />
		</div>
	    </form>
	);
    }
});

var render = function () {
    React.render(
	<Chat server={chatConf.server} me={chatConf.me} password={chatConf.password} other={chatConf.other} chatroom={chatConf.chatroom} nick={chatConf.nick} page={chatConf.page} />,
	document.getElementById(chatConf.element)
    );
}
export default render;
