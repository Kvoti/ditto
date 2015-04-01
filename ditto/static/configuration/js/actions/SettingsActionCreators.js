var SettingsAppDispatcher = require('../../../flux-chat/js/dispatcher/ChatAppDispatcher');
var SettingsConstants = require('../constants/SettingsConstants');

var ActionTypes = SettingsConstants.ActionTypes;

module.exports = {

    clickRole: function(role) {
        SettingsAppDispatcher.dispatch({
            type: ActionTypes.CLICK_ROLE,
            role: role
        });
    },
    
    clickItem: function(item) {
        SettingsAppDispatcher.dispatch({
            type: ActionTypes.CLICK_ITEM,
            item: item
        });
    },

    updateCaseNotesTitle: function (role, text) {
        SettingsAppDispatcher.dispatch({
            type: ActionTypes.UPDATE_CASE_NOTES_TITLE,
            role: role,
            text: text
        });
    },
};
