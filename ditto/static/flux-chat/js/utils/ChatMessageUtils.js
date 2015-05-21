module.exports = {

    convertRawMessage: function(rawMessage, currentThreadID) {
        return {
            id: rawMessage.id,
            threadID: rawMessage.threadID,
            authorName: rawMessage.authorName,
            date: new Date(rawMessage.timestamp),
            text: rawMessage.text,
            isRead: rawMessage.isRead || rawMessage.threadID === currentThreadID
        };
    },

    getCreatedMessageData: function(text, currentThreadID) {
        var timestamp = Date.now();
        return {
            id: 'm_' + timestamp,
            threadID: currentThreadID,
            authorName: Strophe.getNodeFromJid(chatConf.me), // TODO better way/place for this?
            date: new Date(timestamp),
            text: text,
            isRead: true
        };
    },

    getMessageOther: function (threadID) {
        // TODO yuk
        var me = Strophe.getNodeFromJid(chatConf.me);
        // TODO repeated in webutils
	var participants = threadID.split(':');
	if (threadID.indexOf("session:") === 0) {
	    participants = participants.slice(1);
	}	    
	var other = participants[0] === me ? participants[1] : participants[0];
        return other;
    },

    getPrivateChatThreadID: function (from, to) {
	var participants = [from, to];
	participants.sort();
	var threadID = participants.join(':');
        return threadID;
    }
};
