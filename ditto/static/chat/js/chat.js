DITTO.chat = {
    message_template: $('#message_template').text(),
    avatar_template: $('#avatar_template').text(),
    message_input: $('#msg').find('input[type=text]'),
    msgs: $('#msgs'),
    
    privateMessageCallbacks: [],
    outgoingMessageCallbacks: [],

    me: DITTO.chat_name.split('@')[0],

    titleTogglePeriod: 1000,  // can't be any smaller for chrome/ffox

    beep: $('audio').get(0),
    
    renderMessage: function (from, msg) {
	// construct skeleton message from template
	var formatted_message = $(this.message_template);

	// add message text
        formatted_message.find('.media-body').text(msg);

	// configure avatar
	// decide whether avatar goes to the left or right
	if (from === this.me) {
	    formatted_message.find('.media-left').remove();
	    formatted_message.find('.media-body').css('text-align', 'right');
	} else {
	    formatted_message.find('.media-right').remove();
	}
        var avatar = this.getAvatar(from);
        avatar.addClass('media-object');
        formatted_message.find('.media-middle').append(avatar);

	// add message to page and scroll message in to view
        // TODO remove messages once (far) out of view, don't want to append message content indefinitely?
        this.msgs.append(formatted_message);
        this.scrollMessages();
    },

    getAvatar: function (user, size) {
        if (!size) {
            size = 71;
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
        var url = '/static/images/avatars/';  // TODO pass in from page
        var profile_url = '/di/users/';  // TODO pass in, fix tenant part of url
        var avatar = $(this.avatar_template);
        var img = avatar.find('img');
	var avatar_pic = avatars[user];
        if (!avatar_pic) {
            avatar_pic = 'sunshine'
        }
	img.attr('src', url + avatar_pic + '.png');
        img.attr({
            width: size,
            height: size,
        });
        avatar.find('.avatar-name').text(user);
        avatar.find('.avatar-link').attr('href', profile_url + user);
        return avatar;
    },
    
    renderPresence: function () {
	var pres = $('<ul class="list-group"></ul>');
	$.each(this.presence, function (key) {
	    var item = $('<li class="list-group-item"></li>');
	    item.text(key);
	    pres.append(item);
	});
	this.presence_ui.empty();
	this.presence_ui.append(pres);
    },
    
    scrollMessages: function () {
        // TODO remove this hack when properly sort out if chat ui is showing
        try {
            this.msgs.scrollTop(this.msgs[0].scrollHeight);
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
        var msgs = $('#msgs');
        return !msgs.parent('.panel-body').length;
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
