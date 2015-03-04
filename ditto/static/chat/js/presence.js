//
// Set own status and show status of chat partner
//
(function () {
    var connection;

    var my_status_show = $('#status-show');
    var my_status_status = $('#status-status');
    var my_status_status_enabled = $('#status-status-enabled');
    var status_button = $('#set-status span:first');
    var status_menu = status_button.parent().next();
    var custom_status = status_menu.find('input');
    var verbose_status = {
        'away': 'Away',
        'chat': 'Free for chat',
        'dnd': 'Do not disturb',
        'xa': 'Extended away',
    };
    var friends_ui = $('#roster');
    
    $(document).on('connected.ditto.chat', function (e, conn) {
        connection = conn;
	connection.addHandler(onPresence, null, 'presence', null,  null); 
	connection.roster.init(connection);
	connection.roster.registerRequestCallback(acceptFriendRequest);
	connection.roster.registerCallback(handleRoster);
	connection.roster.subscribe(DITTO.chatee);
	connection.roster.get();
    });

    // Prevent status dropdown closing when custom status input given
    // focus
    $('.dropdown .custom').click(function (e) {
        e.stopPropagation();
    });
    
    status_menu.on('click', 'a', function (e) {
        console.log('Status clicked');
        var option = $(this);
        var status_code = option.data('value');
        var pres = $pres();
        var custom = custom_status.val();
        status_button.text(option.text());
        if (status_code) {
            pres.c('show').t(status_code).up();
        }
        if (custom) {
            pres.c('status').t(custom);
            custom_status.val('');
        }
        console.log('sending new status');
        connection.send(pres.tree());
    });

    function onPresence(pres) {
	var msg = $(pres);
	var from = Strophe.getBareJidFromJid(msg.attr('from'));
	var type = Strophe.getBareJidFromJid(msg.attr('type'));
	var show, status;
	
	if (from === DITTO.chatee) {
	    if (type === 'unavailable') {
		$('#other-status-show').text('offline');
		$('#other-status-status').text('');
	    } else {
		show = msg.find('show').text();
		status = msg.find('status').text();
		if (show) {
		    $('#other-status-show').text(verbose_status[show]);
		} else {
		    $('#other-status-show').text('online');
		}
		if (status) {
		    $('#other-status-status').text('STATUS: '  + status);
		} else {
		    $('#other-status-status').text('');
		}
	    }
	}
	return true;
    }

    function acceptFriendRequest (from) {
	connection.roster.authorize(from);
	return true;
    }

    function handleRoster (roster, item) {
        var friends = [];
        $.each(roster, function (i, friend) {
            if (friend.subscription === 'both') {
                username = Strophe.getNodeFromJid(friend.jid);
                friends.push(username);
            }
        });
        renderFriends(friends);
        return true;  // always bloody forget this!
    }

    function renderFriends (friends) {
	var friends_list = $($('#friends_template').text());
	var _item = friends_list.find('.friends-item').remove();
        var item;
        
        var self = this;
	$.each(friends, function (i, username) {
            item = _item.clone();
            item.find('.friends-avatar').append(DITTO.chat.getAvatar(username));
            item.find('.friends-username').text(username);
            item.attr('href', '../../messages/' + username + '/');
            if (username === Strophe.getNodeFromJid(DITTO.chatee)) {
                item.addClass('active');
            }
	    friends_list.append(item);
	});
	friends_ui.empty();
	friends_ui.append(friends_list);
    }
    
})();
