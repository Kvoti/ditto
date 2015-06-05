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

    disconnect: function() {
        ChatAppDispatcher.dispatch({
            type: ActionTypes.DISCONNECT,
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
    },

    receiveStartTyping: function(user, threadID) {
        ChatAppDispatcher.dispatch({
            type: ActionTypes.RECEIVE_START_TYPING,
            user: user,
            threadID: threadID
        });
    },

    receiveStopTyping: function(user, threadID) {
        ChatAppDispatcher.dispatch({
            type: ActionTypes.RECEIVE_STOP_TYPING,
            user: user,
            threadID: threadID
        });
    },

    receiveOnline: function(user, room) {
        ChatAppDispatcher.dispatch({
            type: ActionTypes.RECEIVE_ONLINE,
            user: user,
            room: room
        });
    },

    receiveOffline: function(user, room) {
        ChatAppDispatcher.dispatch({
            type: ActionTypes.RECEIVE_OFFLINE,
            user: user,
            room: room
        });
    },

    joinChatroom: function (roomJID) {
        ChatAppDispatcher.dispatch({
            type: ActionTypes.JOIN_ROOM,
            roomJID: roomJID
        });
    },

    leaveChatroom: function (roomJID) {
        ChatAppDispatcher.dispatch({
            type: ActionTypes.LEAVE_ROOM,
            roomJID: roomJID
        });
    },
    
    receiveChatrooms: function (roomList) {
        ChatAppDispatcher.dispatch({
            type: ActionTypes.RECEIVE_ROOM_LIST,
            rooms: roomList,
        });
    },

    receiveEndThread: function (threadID, rating) {
        ChatAppDispatcher.dispatch({
            type: ActionTypes.RECEIVE_END_THREAD,
            threadID: threadID,
            rating: rating,
        });
    },

    receiveSessionRating: function (threadID, rating) {
        ChatAppDispatcher.dispatch({
            type: ActionTypes.RECEIVE_SESSION_RATING,
            threadID: threadID,
            rating: rating
        });
    },

};
