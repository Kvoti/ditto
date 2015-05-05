var ChatAppDispatcher = require('../dispatcher/ChatAppDispatcher');
var ChatConstants = require('../constants/ChatConstants');
var ChatWebAPIUtils = require('../utils/ChatWebAPIUtils');

var ActionTypes = ChatConstants.ActionTypes;

module.exports = {

    pathChange: function(path) {
        var parts = path.split('/');
        var roomID = parts[parts.length - 2];
        var roomJID = roomID + '@muc.' + Strophe.getDomainFromJid(chatConf.me); // FIXME
        ChatWebAPIUtils.joinChatroom(roomJID);
        ChatAppDispatcher.dispatch({
            type: ActionTypes.PATH_CHANGE,
            path: path
        });
    },
};
