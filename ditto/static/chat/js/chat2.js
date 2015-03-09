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
var classSet = React.addons.classSet;

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
    setMyStatus: function (code, message) {
	console.log('setting status', code, message);
        var pres = $pres();
        if (code) {
            pres.c('show').t(code).up();
        }
        if (message) {
            pres.c('status').t(message);
        }
        this.state.connection.send(pres.tree());
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
	    <div className="row">
	        <div className="col-md-4">
                <div className="list-group">
		<Friends friends={this.state.friends} friendStatus={this.state.friendStatus} current={this.state.talkingTo} switchChat={this.switchChat} userMeta={this.state.userMeta} />
    	        <Chatroom show={this.showChatroom} isInside={this.state.isInChatroom} />
                </div>
	    </div>
	    <div className="col-md-8">
	        <Messages me={this.props.me} talkingTo={this.state.talkingTo} messages={this.state.messages} userMeta={this.state.userMeta} />
	        <WhosTyping users={this.state.whosTyping} />
                <div className="row msgbar">
	        <ComposeMessage onMessageSubmit={this.handleMessageSubmit} onMessageChange={this.handleMessageChange} />
                <MyStatus setStatus={this.setMyStatus} />
                </div>
	    </div>
	    </div>
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
	    var is_current = self.props.current === friend;
	    var status = self.props.friendStatus[friend];
	    return (
		    <Friend is_current={is_current} friend={friend} status={status} key={index} switchChat={self.props.switchChat} userMeta={self.props.userMeta} />
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
	        <a className="list-group-item" href="#" onClick={this.switchChat}>
                <div className="media-left media-middle friends-avatar">
                <Avatar size={50} user={this.props.friend} userMeta={this.props.userMeta} />
                    </div>
                    <div className="media-body">
                <h4 className="media-heading friends-username">{current} {this.props.friend}</h4>
		{status}
                    </div>
	    </a>
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
	var messages = this.props.messages.filter(
	    function (msg) {
		return Strophe.getBareJidFromJid(msg.from) === self.props.talkingTo || Strophe.getBareJidFromJid(msg.to) === self.props.talkingTo
	    }
	);
	var messageNodes = messages.map(function(m, i) {
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

React.render(
    <Chat server={chatConf.server} me={chatConf.me} password={chatConf.password} other={chatConf.other} chatroom={chatConf.chatroom} nick={chatConf.nick} />,
    document.getElementById('chat')
);
