// TODO alternative to using jquery here to parse the XMPP packets?
module.exports = {
    create: {
        privateMessage: function (text, from, to) {
	    return $msg({
	        from: from,
	        to: to,
	        type: 'chat'
	    }).c('body').t(text);
        }
    },
    parse: {
        privateMessage: function (msg) {
            var msg = $(msg);
            return {
		id: msg.find('archived').attr('id'),
                text: msg.find("body:first").text(),
                from: Strophe.getNodeFromJid(msg.attr("from")),
                to: Strophe.getNodeFromJid(msg.attr("to")),
                timestamp: new Date(),
                composing: msg.find('composing'),
                active: msg.find('active')
            };
        },
        archivedPrivateMessage: function (msg) {
            var msg = $(msg);
            // TODO need this group chat hack for now as we're querying
            // the archive for all messages. Really we want to load the
            // last N messags for *each* private chat
            var isGroupChat = msg.find('[type=groupchat]').length;
            if (isGroupChat) {
                return;
            };
            return {
                id: msg.find('result').attr('id'),
	        text: msg.find("body:first").text(),
	        from: Strophe.getNodeFromJid(msg.find('message').attr("from")),
	        to: Strophe.getNodeFromJid(msg.find('message').attr("to")),
	        timestamp: new Date(msg.find('delay').attr('stamp')),

            }
        },
        vCard: function (vcard) {
	    vcard = $(vcard);
	    var role = vcard.find('ROLE').text();
	    var avatar = vcard.find('PHOTO').text();
	    return {role: role, avatar: avatar};
        },
        presence: function (pres) {
            var msg = $(pres);
            var from = Strophe.getNodeFromJid(msg.attr('from'));
            var type = msg.attr('type');
            var code;
            var customMessage;
            var status;
            if (type === 'unavailable') {
	        status = {
                    user: from,
                };
            } else {
	        code = msg.find('show').text();
	        customMessage = msg.find('status').text();
	        status = {
                    user: from,
	            code: code,
	            message: customMessage
	        };
            }
            return status;
        },
        groupPresence: function (pres) {
            var msg = $(pres);
            var added, removed, presence;
            // TODO var nick_taken = msg.find('conflict');
            var from = Strophe.getResourceFromJid(msg.attr('from'));
            // First time we enter the chatroom for a new network the room
            // needs to be created and configured
            var isNewRoom = msg.find('status[code=201]').length;
            presence = {
                user: from,
                isNewRoom: isNewRoom
            }
            added = msg.find('item[role!=none]');
            if (added.length) {
                presence.added = true;
            }
            removed = msg.find('item[role=none]');
            if (removed.length) {
                presence.removed = true;
            }
            return presence;
        },
        groupMessage: function (msg) {
            var msg = $(msg);
            var body = msg.find("body:first").text();
            var from = Strophe.getResourceFromJid(msg.attr("from"));
            var to = Strophe.getNodeFromJid(msg.attr("from"));
            var when = msg.find('delay');
            if (when.length) {
	        when = new Date(when.attr('stamp'));
            } else {
	        when = new Date();
            }
            return {
                id: msg.find('archived').attr('id'),
                from: from,
                to: to,
                text: body,
                timestamp: when
            }
        }
    }
}
