// TODO alternative to using jquery here to parse the XMPP packets?

// TODO is increasing integer ok to use as id?
var _messageID = 0;

import ChatMessageUtils from './ChatMessageUtils';

function getNewMessageID () {
    return _messageID++;
}

function setThreadFields(message) {
    var thread = [message.from, message.to];
    thread.sort();
    if (!message.threadID) {
        message.threadID = thread.join(':');
    }
  message.threadName = message.threadID ? ChatMessageUtils.getMessageThreadName(message.threadID) : thread.join(' and ');
    message.authorName = message.from;
}    


module.exports = {
    create: {
        privateMessage: function (text, from, to) {
	    return $msg({
	        from: from,
	        to: to,
	        type: 'chat'
	    }).c('body').t(text).up();
        }
    },
    parse: {
        privateMessage: function (msg) {
            var msg = $(msg);
            var message = {
		id: msg.find('archived').attr('id'),
                text: msg.find("body:first").text(),
                from: Strophe.getNodeFromJid(msg.attr("from")),
                to: Strophe.getNodeFromJid(msg.attr("to")),
                timestamp: new Date(),
                composing: msg.find('composing'),
                active: msg.find('active'),
                threadID: msg.find('thread').text(),
		// this is our custom element to indicate a chat has ended
		ended: msg.find('ended'),
            };
            setThreadFields(message);
            return message;
        },
        archivedPrivateMessage: function (msg) {
            var msg = $(msg);
            // TODO need this group chat hack for now as we're querying
            // the archive for all messages. Really we want to load the
            // last N messags for *each* private chat
            var isGroupChat = msg.find('[type=groupchat]').length;
	    var from = msg.find('delay').attr("from");
            if (isGroupChat || !from) {
                return;
            };
            var message = {
                id: msg.find('result').attr('id'),
	        text: msg.find("body:first").text(),
	        from: Strophe.getNodeFromJid(from),
	        to: Strophe.getNodeFromJid(msg.find('message').attr("to")),
	        timestamp: new Date(msg.find('delay').attr('stamp')),
                threadID: msg.find('thread').text(),
		ended: msg.find('ended'),
            }
            setThreadFields(message);
            return message;
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
            var added, removed, presence, destroyed;
            // TODO var nick_taken = msg.find('conflict');
            var from = Strophe.getResourceFromJid(msg.attr('from'));
            var room = Strophe.getBareJidFromJid(msg.attr('from'));
            // First time we enter the chatroom for a new network the room
            // needs to be created and configured
            var isNewRoom = msg.find('status[code=201]').length;
            presence = {
                user: from,
                isNewRoom: isNewRoom,
                room: room
            }
            added = msg.find('item[role!=none]');
            if (added.length) {
                presence.added = true;
            }
            removed = msg.find('item[role=none]');
            if (removed.length) {
                presence.removed = true;
            }
            destroyed = msg.find('destroy');
            if (destroyed.length) {
                presence.destroyed = true;
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
                id: getNewMessageID(),
                from: from,
                to: to,
                text: body,
                timestamp: when
            }
        },
        roomList: function (result) {
            var result = $(result);
            var roomJIDs = result.find('item').map(function () { return $(this).attr('jid'); });
            return $.makeArray(roomJIDs);
        },
      RSM: function (msg) {
        msg = $(msg);
        let first = msg.find('first');
        if (first.attr('index') !== '0') {
          return first.text();
        }
      }
    }
};
