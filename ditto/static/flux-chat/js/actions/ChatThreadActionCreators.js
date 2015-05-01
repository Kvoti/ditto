var ChatAppDispatcher = require('../dispatcher/ChatAppDispatcher');
var ChatConstants = require('../constants/ChatConstants');
var ChatWebAPIUtils = require('../utils/ChatWebAPIUtils');

var ActionTypes = ChatConstants.ActionTypes;

module.exports = {

    clickThread: function(threadID) {
        ChatAppDispatcher.dispatch({
            type: ActionTypes.CLICK_THREAD,
            threadID: threadID
        });
    },

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
    },
    
    createRoom: function(roomName) {
        var roomJID = roomName + '@muc' + chatConf.server // FIXME
        ChatAppDispatcher.dispatch({
            type: ActionTypes.CREATE_ROOM,
            roomJID: roomJID
        });
        ChatWebAPIUtils.joinChatroom(roomJID);
    }
};
