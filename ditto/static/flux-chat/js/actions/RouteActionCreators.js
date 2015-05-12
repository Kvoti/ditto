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
        var parts = path.split('/');
        var threadID = parts[parts.length - 2];
        if (threadID !== 'messages') {
            var friend = ChatMessageUtils.getMessageOther(threadID);
            ChatWebAPIUtils.addFriend(friend);
            ChatAppDispatcher.dispatch({
                type: ActionTypes.CHANGE_PRIVATE_CHAT,
                threadID: threadID
            });
        }
    },
};
