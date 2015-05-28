var keyMirror = require('keymirror');

module.exports = {

    ActionTypes: keyMirror({
        CONNECT: null,
        DISCONNECT: null,

        CREATE_THREAD: null,
	END_THREAD: null,
        
        CREATE_MESSAGE: null,
        START_TYPING: null,
        STOP_TYPING: null,

        RECEIVE_RAW_CREATED_MESSAGE: null,
        RECEIVE_RAW_PRIVATE_MESSAGE: null,
        RECEIVE_RAW_MESSAGES: null,  // TODO think I can remove this now
        RECEIVE_USER_PROFILE: null,
        RECEIVE_START_TYPING: null,
        RECEIVE_STOP_TYPING: null,

        RECEIVE_ONLINE: null,
        RECEIVE_OFFLINE: null,
        RECEIVE_CHAT_STATUS: null,

	RECEIVE_END_THREAD: null,
	
        RECEIVE_ROOM_LIST: null,
        CREATE_ROOM: null,
        
        CHANGE_AVATAR: null,

        CHANGE_CHATROOM: null,
        CHANGE_PRIVATE_CHAT: null,
        CHANGE_PRIVATE_TYPE: null
    }),

    chatStatus: {
        away: 'Away',
        chat: 'Available',
        dnd: 'Do not disturb',
        xa: 'Extended away',
    },

    stillTypingTimeout: 3000,

    connected: 'connected',

    disconnected: 'disconnected',

};
