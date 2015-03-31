var ChatAppDispatcher = require('../dispatcher/ChatAppDispatcher');
var ChatConstants = require('../constants/ChatConstants');
var ChatWebAPIUtils = require('../utils/ChatWebAPIUtils');
var ChatMessageUtils = require('../utils/ChatMessageUtils');

var ActionTypes = ChatConstants.ActionTypes;

module.exports = {

    createMessage: function(text, currentThreadID) {
        ChatAppDispatcher.dispatch({
            type: ActionTypes.CREATE_MESSAGE,
            text: text,
            currentThreadID: currentThreadID
        });
        var message = ChatMessageUtils.getCreatedMessageData(text, currentThreadID);
        ChatWebAPIUtils.createMessage(message);
    },

    startTyping: function(currentThreadID) {
        ChatAppDispatcher.dispatch({
            type: ActionTypes.START_TYPING,
            currentThreadID: currentThreadID
        });
        ChatWebAPIUtils.startTyping(currentThreadID);
    },

    stopTyping: function(currentThreadID) {
        ChatAppDispatcher.dispatch({
            type: ActionTypes.STOP_TYPING,
            currentThreadID: currentThreadID
        });
        ChatWebAPIUtils.stopTyping(currentThreadID);
    }
    
};
