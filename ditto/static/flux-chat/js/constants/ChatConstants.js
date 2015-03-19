var keyMirror = require('keymirror');

module.exports = {

    ActionTypes: keyMirror({
        CONNECT: null,
        CLICK_THREAD: null,
        CREATE_MESSAGE: null,
        RECEIVE_RAW_CREATED_MESSAGE: null,
        RECEIVE_RAW_PRIVATE_MESSAGE: null,
        RECEIVE_RAW_MESSAGES: null,
        RECEIVE_USER_PROFILE: null,
    }),

    chatStatus: {
        away: 'Away',
        chat: 'Free for chat',
        dnd: 'Do not disturb',
        xa: 'Extended away',
    }
    
};
