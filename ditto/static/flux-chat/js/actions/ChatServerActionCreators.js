var ChatAppDispatcher = require('../dispatcher/ChatAppDispatcher');
var ChatConstants = require('../constants/ChatConstants');

var ActionTypes = ChatConstants.ActionTypes;

module.exports = {

    connect: function(connection) {
        ChatAppDispatcher.dispatch({
            type: ActionTypes.CONNECT,
            connection: connection
        });
    },
    
    // receiveAll: function(rawMessages) {
    //   ChatAppDispatcher.dispatch({
    //     type: ActionTypes.RECEIVE_RAW_MESSAGES,
    //     rawMessages: rawMessages
    //   });
    // },

    receivePrivateMessage: function(rawMessage) {
        ChatAppDispatcher.dispatch({
            type: ActionTypes.RECEIVE_RAW_PRIVATE_MESSAGE,
            rawMessage: rawMessage
        });
    },
    
    receiveCreatedMessage: function(createdMessage) {
        ChatAppDispatcher.dispatch({
            type: ActionTypes.RECEIVE_RAW_CREATED_MESSAGE,
            rawMessage: createdMessage
        });
    },

    receiveUserProfile: function(userProfile) {
        ChatAppDispatcher.dispatch({
            type: ActionTypes.RECEIVE_USER_PROFILE,
            userProfile: userProfile
        });
    },
    
    receiveChatStatus: function(status) {
        ChatAppDispatcher.dispatch({
            type: ActionTypes.RECEIVE_CHAT_STATUS,
            status: status
        });
    }
    
};
