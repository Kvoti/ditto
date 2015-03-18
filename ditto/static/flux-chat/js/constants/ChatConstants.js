var keyMirror = require('keymirror');

module.exports = {

    ActionTypes: keyMirror({
        CONNECT: null,
        CLICK_THREAD: null,
        CREATE_MESSAGE: null,
        RECEIVE_RAW_CREATED_MESSAGE: null,
        RECEIVE_RAW_PRIVATE_MESSAGE: null,
        RECEIVE_RAW_MESSAGES: null
    })

};
