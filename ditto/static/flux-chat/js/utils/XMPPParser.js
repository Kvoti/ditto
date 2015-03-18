// TODO alternative to using jquery here to parse the XMPP packets?

module.exports = {
    privateMessage: function (msg) {
        var msg = $(msg);
        return {
            text: msg.find("body:first").text(),
            from: Strophe.getNodeFromJid(msg.attr("from")),
            to: Strophe.getNodeFromJid(msg.attr("to")),
            timestamp: new Date(),
            composing: msg.find('composing'),
            active: msg.find('active'),
        }
    }
}
