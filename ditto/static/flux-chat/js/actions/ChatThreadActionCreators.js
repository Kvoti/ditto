var ChatAppDispatcher = require('../dispatcher/ChatAppDispatcher');
var ChatConstants = require('../constants/ChatConstants');

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
    }
    
};
