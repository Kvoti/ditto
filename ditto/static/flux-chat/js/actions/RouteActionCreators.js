var ChatAppDispatcher = require('../dispatcher/ChatAppDispatcher');
var ChatConstants = require('../constants/ChatConstants');
var ChatWebAPIUtils = require('../utils/ChatWebAPIUtils');
var ChatMessageUtils = require('../utils/ChatMessageUtils');

var ActionTypes = ChatConstants.ActionTypes;

module.exports = {

    changeChatroom: function(path) {
        var parts = path.split('/');
        var roomID = parts[parts.length - 2];
        if (roomID !== 'chatroom') {
            var roomJID = roomID + '@muc.' + Strophe.getDomainFromJid(chatConf.me); // FIXME
            ChatWebAPIUtils.joinChatroom(roomJID);
            ChatAppDispatcher.dispatch({
                type: ActionTypes.CHANGE_CHATROOM,
                roomJID: roomJID,
                roomID: roomID
            });
        }
    },

  changePrivateChat: function(path) {
    path = decodeURIComponent(path);
        var parts = path.split('/');
        var threadID = parts[parts.length - 2];
        var threadType;
        if (parts.length === 5) {
            var friend = ChatMessageUtils.getMessageOther(threadID);
            threadType = parts[parts.length - 3] === 'messages' ? 'message' : 'session';  // FIXME
	    // TODO only if not already friend
            ChatWebAPIUtils.addFriend(friend);
	    // TODO only if new session
            ChatWebAPIUtils.startSession(
		threadID,
		[
                    // TODO gah, fix all the places where we do this to get the current user
		    Strophe.getNodeFromJid(chatConf.me),
		    friend
		]
	    );
            ChatAppDispatcher.dispatch({
                type: ActionTypes.CHANGE_PRIVATE_CHAT,
                threadType: threadType,
                threadID: threadID
            });
        } else {
            threadType = parts[parts.length - 2] === 'messages' ? 'message' : 'session';  // FIXME
            ChatAppDispatcher.dispatch({
                type: ActionTypes.CHANGE_PRIVATE_CHAT_TYPE,
                threadType: threadType
            });
        }
    },
};
