var ChatAppDispatcher = require('../dispatcher/ChatAppDispatcher');
var ChatConstants = require('../constants/ChatConstants');
var ChatWebAPIUtils = require('../utils/ChatWebAPIUtils');

var ActionTypes = ChatConstants.ActionTypes;

module.exports = {

    createThread: function(threadID) {
        ChatAppDispatcher.dispatch({
            type: ActionTypes.CREATE_THREAD,
            threadID: threadID
        });
    },

    // TODO not sure if room related stuff should be separated out
    clickRoom: function(roomJID) {
        ChatAppDispatcher.dispatch({
            type: ActionTypes.CLICK_ROOM,
            roomJID: roomJID
        });
        ChatWebAPIUtils.joinChatroom(roomJID);
    },
    
    createRoom: function(roomName) {
        var roomJID = roomName + '@muc.' + Strophe.getDomainFromJid(chatConf.me); // FIXME
        ChatAppDispatcher.dispatch({
            type: ActionTypes.CREATE_ROOM,
            roomJID: roomJID
        });
        ChatWebAPIUtils.joinChatroom(roomJID);
    },

    toggleChatType: function () {
        ChatAppDispatcher.dispatch({
            type: ActionTypes.TOGGLE_CHAT_TYPE,
        });
    },

    endThread: function (threadID) {
	ChatWebAPIUtils.endThread(threadID);
        ChatAppDispatcher.dispatch({
            type: ActionTypes.END_THREAD,
	    threadID: threadID,
        });
    },

    rateThread: function (threadID, rating) {
	ChatWebAPIUtils.rateThread(threadID, rating);
        ChatAppDispatcher.dispatch({
            type: ActionTypes.RATE_THREAD,
	    threadID: threadID,
            rating: rating
        });
    }
    
};
