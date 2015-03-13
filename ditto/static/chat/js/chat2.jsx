import React from 'react';
// TODO prob only load components we need?
import * as Bootstrap from "vendor/react-bootstrap/index";  // TODO shouldn't this work without /index
import * as Chat from 'chat/js/chat.min';

var update = React.addons.update;
var classSet = React.addons.classSet;
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var getMessages = function (messages, other) {
    return messages.filter(
	function (msg) {
	    return msg.from === other || msg.to === other;
	}
    );
};

// util functions
function isPageHidden () {
    // TODO keep this kind of things to existing polyfills (loaded with modernizr?)?
    return document.hidden || document.webkitHidden || document.mozHidden || document.msHidden;
};
// ------

Chat.connect(
    chatConf.server,
    chatConf.me,
    chatConf.password,
    chatConf.chatroom, // TODO this will need to be multiple rooms
    chatConf.nick
);

var ChatApp = React.createClass({
    getInitialState: function () {
	return {
	    talkingTo: this.props.other,
	    chat: Chat.getState()
	}
    },
    componentDidMount: function() {
	Chat.addChangeListener(this._onChange);
    },
    componentWillUnmount: function() {
	Chat.removeChangeListener(this._onChange);
    },
    _onChange: function() {
	this.setState({chat: Chat.getState()});
    },
    switchChat: function (friend) {
	this.setState({
	    talkingTo: friend,
	});
    },
    // TODO not sure how to do this now
//    notifyNewMessage: function (msg) {
//	console.log('playing beep');
//	document.getElementById('new-message-beep').play();
//	var notification = new Notification("New message", {
//	    icon : "/static/images/ditto-logo.png",
//	    body: msg.slice(0, 140)
//	});
//	// TODO this is supposed to go to the right tab in chrome but doesn't seem to work
//	notification.onclick = function () {
//	    window.focus();
//	};
//    },
    handleMessageSubmit: function (message) {
	if (this.props.page === 'chatroom') {
	    Chat.sendGroupMessage(message);
	} else {
	    Chat.sendPrivateMessage(this.state.talkingTo, message);
	}
    },
    handleMessageChange: function () {
	Chat.sendIsTyping();
    },
    render: function () {
	var messages;
	if (!this.props.page) {
	    // For now we have some pages with no chat UI elements but
	    // we're still connected to chat so we can, for example, beep
	    // on new messages. TODO maybe that should be separated out
	    // from the react stuff?
	    return <div></div>;
	} else if (this.state.chat.connectionStatus !== 'connected') {
	    return (
		<div>
		    {this.state.chat.connectionStatus}
		</div>
	    );
	} else if (this.props.page === 'chatroom') {
	    return (
		<div className="row">
    		    <div className="col-md-8">
    			<Messages me={Strophe.getNodeFromJid(this.props.me)} talkingTo={this.state.talkingTo} messages={this.state.chat.chatroomMessages} userMeta={this.state.chat.userMeta} />
			<div className="row msgbar">
      			    <ComposeMessage onMessageSubmit={this.handleMessageSubmit} onMessageChange={this.handleMessageChange} />
			</div>
    		    </div>
		    <div className="col-md-4">
			<ChatroomPresence users={this.state.chat.chatroomPresence}/>
		    </div>
		</div>
	    );
	} else if (this.props.page === 'messages') {
	    messages = getMessages(this.state.chat.messages, this.state.talkingTo);
	    return (
    		<div className="row">
    		    <div className="col-md-4">
			<div className="list-group">
    			    <Friends messages={this.state.chat.messages} friends={this.state.chat.friends} friendStatus={this.state.chat.friendStatus} current={this.state.talkingTo} switchChat={this.switchChat} userMeta={this.state.chat.userMeta} />
			</div>
    		    </div>
    		    <div className="col-md-8">
    			<Messages me={Strophe.getNodeFromJid(this.props.me)} talkingTo={this.state.talkingTo} messages={messages} userMeta={this.state.chat.userMeta} />
    			<WhosTyping users={this.state.whosTyping} />
			<div className="row msgbar">
    			    <ComposeMessage onMessageSubmit={this.handleMessageSubmit} onMessageChange={this.handleMessageChange} />
			    <MyStatus setStatus={this.setMyStatus} />
			</div>
    		    </div>
    		</div>
	    );
	}
    }
});

var WhosOnline = React.createClass({
    usersPerPanel: 9, // TODO could be props
    getInitialState: function () {
	return Chat.whosOnline();
    },
    componentDidMount: function() {
	Chat.addChangeListener(this._onChange);
    },
    componentWillUnmount: function() {
	Chat.removeChangeListener(this._onChange);
    },
    _onChange: function() {
	this.setState(Chat.whosOnline());
    },
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
	var groupedUsers = this.groupUsers(this.state.online);
	var items = groupedUsers.map((group, i) => {
	    return (
		<Bootstrap.CarouselItem key={i}>
		    <WhosOnlineItem users={group} key={i} />
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
		    <Avatar size={100} user={user} />
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
		    <Avatar size={50} user={this.props.friend} />
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
	// Note, tried to calculate the height from other dom elements but it's easier just to hardcode this vaule and change it when the css changes
	var height = $(window).height() - 160;
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
	    // TODO this key should be unique across all messages, how do I do that?
	    return (
		<Message me={self.props.me} from={m.from} to={m.to} message={m.message} when={m.when} userMeta={userMeta} key={m.when} />
	    );
	});
	var style = {height: this.state.height}
	return (
	    <div style={style} id="msgs" ref="messages">
	    <ReactCSSTransitionGroup transitionName="example">
		{messageNodes}
	    </ReactCSSTransitionGroup>
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
    		<Avatar size={50} user={this.props.from} />
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
    getInitialState: function () {
	return Chat.getUserProfiles();
    },
    componentDidMount: function() {
	Chat.addChangeListener(this._onChange);
    },
    componentWillUnmount: function() {
	Chat.removeChangeListener(this._onChange);
    },
    _onChange: function() {
	this.setState(Chat.getUserProfiles());
    },
    render: function () {
	// TODO where to put global constant state like this?
	var avatarSVGs = $('#avatar_svgs').text();
	var avatarName;
	var profile = this.state.profiles[this.props.user];
	if (profile) {
	    avatarName = profile.avatar;
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
	    <div className="avatar">
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

var ChatroomModule = React.createClass({
    getInitialState: function () {
	return Chat.getState();
    },
    componentDidMount: function() {
	Chat.addChangeListener(this._onChange);
    },
    componentWillUnmount: function() {
	Chat.removeChangeListener(this._onChange);
    },
    _onChange: function() {
	this.setState(Chat.getState());
    },
    render: function () {
	var messages = this.state.chatroomMessages.slice(-5);
	return (
	    <Messages messages={messages} />
	);
    }
});
    
var render = function () {
    var whosonline = document.getElementById('whosonline');
    var chat = document.getElementById('chat');
    var chatroomModule = document.getElementById('chat-module');
    if (whosonline) {
	React.render(<WhosOnline />, whosonline);
    };
    if (chat) {
	React.render(
	    <ChatApp me={chatConf.me} other={chatConf.other} page={chatConf.page} />, chat
	);
    }
    if (chatroomModule) {
	React.render(
	    <ChatroomModule />, chatroomModule
	);
    }
    React.render(
	<Avatar user="mark" size={50} />, document.getElementById('nav-avatar')
    );
}
export default render;
