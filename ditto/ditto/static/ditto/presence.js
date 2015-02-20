//
// Set own status and show status of chat partner
//
(function () {
    var connection;

    var my_status_show = $('#status-show');
    var my_status_status = $('#status-status');
    var my_status_status_enabled = $('#status-status-enabled');
    var my_status_modal = $('#myModal');
    var my_status_modal_save = my_status_modal.find('.btn-primary');
    
    $(document).on('connected.ditto.chat', function (e, conn) {
        connection = conn;
	connection.addHandler(onPresence, null, 'presence', null,  null); 
	connection.roster.init(connection);
	connection.roster.registerRequestCallback(acceptFriendRequest);
	connection.roster.subscribe(DITTO.chatee);
	connection.roster.get();
    });

    // respond to user changing their status
    my_status_show.change(function () {
	var show = $(this).val();
	var pres = $pres();
	if (show) {
	    pres.c('show').t(show).up();
	}
        if (my_status_status_enabled.is(':checked')) {
            my_status_status.data('pres', pres);
            my_status_modal.modal('show');
        } else {
            // no custom message so send status immediately
	    connection.send(pres.tree());
        }
    });

    // modal for custom status message
    my_status_modal_save.click(function () {
        my_status_modal.modal('hide');
        var pres = my_status_status.data('pres');
	var status = my_status_status.val();
	if (status) {
	    pres.c('status').t(status);
	}
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
		    $('#other-status-show').text(show);
		} else {
		    $('#other-status-show').text('online');
		}
		if (status) {
		    $('#other-status-status').text(status);
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
    
})();
