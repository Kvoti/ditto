DITTO.chat = {
    message_template: $('#message_template').text(),
    avatar_template: $('#avatar_template').text(),
    message_input: $('#msg').find('input[type=text]'),
    group_msgs: $('#msgs'),
    pchat_msgs: $('#pchat_msgs'),
    avatars: $('#avatar_svgs').text(),
    privateMessageCallbacks: [],
    outgoingMessageCallbacks: [],

    me: DITTO.chat_name.split('@')[0],

    titleTogglePeriod: 1000,  // can't be any smaller for chrome/ffox

    beep: $('audio').get(0),

    renderPrivateMessage: function (from, when, msg, to) {
        var message_pane = this.getPchatContainer(from, to);
        this._renderMessage(from, when, msg, message_pane);
    },

    renderGroupMessage: function (from, when, msg) {
        this._renderMessage(from, when, msg, this.group_msgs);
    },
    
    getPchatContainer: function (from, to) {
        var message_pane = $('.messages-' + (to || from));
        if (!message_pane.length) {
            message_pane = this.pchat_msgs;
        }
        return message_pane;
    },
    
    _renderMessage: function (from, when, msg, container) {
        var heading;
        var timestamp;
	// construct skeleton message from template
	var formatted_message = $(this.message_template);

	// add message text
        heading = formatted_message.find('.media-heading');
        heading.prepend(from);
        timestamp = heading.find('time');
        when = when.toISOString();
        timestamp.text(when);
        timestamp.attr('datetime', when);
        formatted_message.find('.media-body').append(msg);

	// configure avatar
	// decide whether avatar goes to the left or right
	if (from === this.me) {
	    formatted_message.find('.media-left').remove();
	    formatted_message.find('.media-body').css('text-align', 'right');
	} else {
	    formatted_message.find('.media-right').remove();
	}
        var avatar = this.getAvatar(from, null);
        avatar.addClass('media-object');
        formatted_message.find('.media-middle').append(avatar);

	// add message to page and scroll message in to view
        // TODO remove messages once (far) out of view, don't want to append message content indefinitely?
        container.append(formatted_message);
        container.find('time:last').timeago();
        this.scrollMessages(container);
    },

    getAvatar: function (user, size, with_name) {
        if (!size) {
            size = 50;
        }
        // TODO big job to sort out avatars. mod_avatar/pubsub not
        // supported by mongooseim so need custom solution.  Can maybe
        // hack something up with avatar 'chatroom' and bot that
        // published avatar changes. Don't think MUC scales well
        // though for proper pubsub...
        var avatars = {
            'mark': 'popcorn',
            'sarah': 'melon',
        }
        var profile_url = '/di/users/';  // TODO pass in, fix tenant part of url
        var avatar = $(this.avatar_template);
	var avatar_pic = avatars[user];
        if (!avatar_pic) {
            avatar_pic = 'sunshine'
        }
        var graphic = $(this.avatars);
        graphic.find('>g[id!=' + avatar_pic + ']').remove();
        graphic.find('>g').show();
        graphic.attr({
            width: size,
            height: size,
        });
        avatar.find('p:first').append(graphic);
        if (with_name) {
            avatar.find('.avatar-name').text(user);
        } else {
            avatar.find('.avatar-name').remove();
        }
        avatar.find('.avatar-link').attr('href', profile_url + user);
        return avatar;
    },
    
    renderPresence: function () {
	var presence = $($('#group_presence_template').text());
	var _item = presence.find('.presence-item').remove();
        var item;
        
        var self = this;
	$.each(this.presence, function (i, username) {
            item = _item.clone();
            item.find('.presence-avatar').append(self.getAvatar(username));
            item.find('.presence-username').text(username);
	    presence.append(item);
	});
	this.presence_ui.empty();
	this.presence_ui.append(presence);
    },
    
    scrollMessages: function (container) {
        // TODO remove this hack when properly sort out if chat ui is showing
        container = container || this.group_msgs;
        try {
            container.scrollTop(container[0].scrollHeight);
        } catch (e) {
        }
    },
        
    addPrivateMessageCallback: function (callback) {
	this.privateMessageCallbacks.push(callback);
    },

    addOutgoingMessageCallback: function (callback) {
	this.outgoingMessageCallbacks.push(callback);
    },

    in_focus: true,
    
    newMessageText: 'New Message...',

    isPageHidden: function () {
	return document.webkitHidden || document.mozHidden;
    },
	
    notifyNewMessage: function (callback) {
        this.beep.play();
        
	var notification = new Notification("New message", {
	    icon : "/static/images/ditto-logo.png"
	});
	notification.onclick = function () {
            window.focus();
        };
	
	// toggle page title
	// (notification shim falls back to title toggling if
	// notifications not supported, perhaps we don't need both?)
        if (!this.is_toggling_title) {
            this.is_toggling_title = true;
	    var title = $('title');
	    this.orig_page_title = title.text();
	    this.toggleTitle();
        }
    },

    toggleTitle: function () {
	var title = $('title');
	if (!this.isPageHidden()) {
	    title.text(this.orig_page_title);
            this.is_toggling_title = false;
	} else {
	    if (title.text() === this.newMessageText) {
		title.text(this.orig_page_title);
	    } else {
		title.text(this.newMessageText);
	    }
	    var self = this;
	    window.setTimeout(
		function () { self.toggleTitle(); },
		this.titleTogglePeriod
	    );
	}
    }

};

$(document).ready(function () {
    var connection = null;

    DITTO.chat.message_input.focus();

    function getNotificationPermission () {
	if (Notification.permission !== 'granted') {
	    Notification.requestPermission();
	}
    }
    getNotificationPermission();
    $('body').one("click", getNotificationPermission);  // chrome

    function isMainChatroom() {
        return window.location.href.indexOf('chatroom') !== -1 || window.location.href.indexOf('messages') !== -1;
    }
    
    function resizeMessageContainer() {
        var height = $(window).height() - $('.msgbar').height() - $('.navbar').height() - parseInt($('.navbar').css('margin-bottom'), 10) -
            $('footer').height() - parseInt($('footer').css('margin-bottom'), 10);
        var page_head = $('.page-heading');
        if (page_head.length) {
            height -= page_head.height() + parseInt(page_head.css('margin-bottom'));
        }
        var chat = $('#msgs, #presence');
        chat.css('height', height);
        DITTO.chat.scrollMessages();
    }
    if (isMainChatroom()) {
        window.onresize = resizeMessageContainer;
        resizeMessageContainer();
    }
    
    $('#msg').submit(function (e) {
        e.preventDefault();
	if (!connection) {
	    // TODO give user feedback that we're waiting on the connection?
	    return;
	}
        var msg = DITTO.chat.message_input.val();
        if (msg) {
            DITTO.chat.message_input.val('');
	    DITTO.chat.sendMessage(msg);
        }
    });
    
    function connect () {
	connection = new Strophe.Connection('ws://' + DITTO.chat_ip + ':5280/ws-xmpp');
	connection.rawInput = rawInput;
	connection.rawOutput = rawOutput;
	
	connection.connect(
	    DITTO.chat_name, DITTO.chat_pass, onConnect
	);
    }
    
    function onConnect (status) {
	if (status == Strophe.Status.CONNECTING) {
	    console.log('Strophe is connecting.');

	} else if (status == Strophe.Status.CONNFAIL) {
	    console.log('Strophe failed to connect.');

	} else if (status == Strophe.Status.DISCONNECTING) {
	    console.log('Strophe is disconnecting.');

	} else if (status == Strophe.Status.DISCONNECTED) {
	    console.log('Strophe is disconnected.');
            $(document).trigger('disconnected.ditto.chat', connection);

	} else if (status == Strophe.Status.CONNECTED) {
	    console.log('Strophe is connected.');
            $(document).trigger('connected.ditto.chat', connection);
	}
    }

    function rawInput(data) {
	// console.log('RECV: ', data);
    }

    function rawOutput(data) {
	// console.log('SENT: ', data);
    }

    connect();
});
