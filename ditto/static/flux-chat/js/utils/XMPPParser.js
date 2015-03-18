// TODO alternative to using jquery here to parse the XMPP packets?
module.exports = {
    privateMessage: function (msg) {
        console.log('new', msg);
        var msg = $(msg);
        return {
            text: msg.find("body:first").text(),
            from: Strophe.getNodeFromJid(msg.attr("from")),
            to: Strophe.getNodeFromJid(msg.attr("to")),
            timestamp: new Date(),
            composing: msg.find('composing'),
            active: msg.find('active'),
        }
    },

    archivedPrivateMessage: function (msg) {
        var msg = $(msg);
        // TODO need this group chat hack for now as we're querying
        // the archive for all messages. Really we want to load the
        // last N messags for *each* private chat
        var isGroupChat = msg.find('[type=groupchat]').length;
        if (isGroupChat) {
            return;
        }
        return {
            id: msg.find('result').attr('id'),
	    text: msg.find("body:first").text(),
	    from: Strophe.getNodeFromJid(msg.find('message').attr("from")),
	    to: Strophe.getNodeFromJid(msg.find('message').attr("to")),
	    timestamp: new Date(msg.find('delay').attr('stamp')),

        }
    }
}
