DITTO.chat = {
    message_template: $('#message_template').text(),
    message_input: $('#msg').find('input[type=text]'),
    msgs: $('#msgs'),
    
    themes: ['sky', 'vine', 'lava', 'gray', 'industrial', 'social'],
    avatars: {},

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
	var avatar = formatted_message.find('img');
	var avatar_theme = this.avatars[from];
	if (!avatar_theme) {
	    avatar_theme = this.themes[Math.floor(Math.random() * (this.themes.length - 1))];
	    this.avatars[from] = avatar_theme;
	}
	// TODO check .attr with untrusted input is safe!
	avatar.attr('data-src', 'holder.js/50x50/auto/' + avatar_theme + '/text:' + from);
	avatar.attr('alt', from);
	// decide whether avatar goes to the left or right
	if (from === this.me) {
	    formatted_message.find('.media-left').remove();
	    formatted_message.find('.media-body').css('text-align', 'right');
	} else {
	    formatted_message.find('.media-right').remove();
	}
	Holder.run({images:formatted_message.find('img')[0]});

	// add message to page and scroll message in to view
        this.msgs.append(formatted_message);
        this.scrollMessages();
    },

    scrollMessages: function () {
        this.msgs.scrollTop(this.msgs[0].scrollHeight);
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


    function resizeMessageContainer() {
        var height = $(window).height() - $('.msgbar').height() - $('.navbar').height() - parseInt($('.navbar').css('margin-bottom'), 10);
        var msgs = $('#msgs');
        msgs.css('height', height);
        DITTO.chat.scrollMessages();
    }
    window.onresize = resizeMessageContainer;
    resizeMessageContainer();
    
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
	connection = new Strophe.Connection('ws://' + DITTO.chat_domain + ':5280/ws-xmpp');
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
	console.log('RECV: ', data);
    }

    function rawOutput(data) {
	console.log('SENT: ', data);
    }

    connect();
});
