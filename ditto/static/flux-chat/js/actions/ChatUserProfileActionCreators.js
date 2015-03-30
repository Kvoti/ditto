var ChatAppDispatcher = require('../dispatcher/ChatAppDispatcher');
var ChatConstants = require('../constants/ChatConstants');
var ChatWebAPIUtils = require('../utils/ChatWebAPIUtils');

var ActionTypes = ChatConstants.ActionTypes;

module.exports = {

    changeAvatar: function(avatarName) {
        ChatAppDispatcher.dispatch({
            type: ActionTypes.CHANGE_AVATAR,
            user: Strophe.getNodeFromJid(chatConf.me),  // TODO where should this come from?
            avatarName: avatarName
        });
        ChatWebAPIUtils.changeAvatar(avatarName);
    }

};
