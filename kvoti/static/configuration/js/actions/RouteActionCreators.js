var SettingsAppDispatcher = require('../../../flux-chat/js/dispatcher/ChatAppDispatcher');
var Constants = require('../constants/SettingsConstants');

var ActionTypes = Constants.ActionTypes;

module.exports = {

    changeChatroom: function(path) {
        var parts = path.split('/');
        var roomID = parts[parts.length - 2];
        console.log('changing room', roomID);
        if (roomID !== 'chatroom') {
            SettingsAppDispatcher.dispatch({
                type: ActionTypes.CHANGE_ROOM,
                room: roomID,
            });
        }
    },

};
