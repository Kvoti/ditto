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

    // TODO not sure here whether to verbosely list out all the text items that can be changed
    // or whether to have a single updateText action that specifies *which* bit of text to be
    // updated.
    updatePostSessionFeedbackTitle: function (role, text) {
        SettingsAppDispatcher.dispatch({
            type: ActionTypes.UPDATE_POST_SESSION_FEEDBACK_TITLE,
            role: role,
            text: text
        });
    },
    
    updatePostSessionFeedbackQuestion: function (role, text) {
        SettingsAppDispatcher.dispatch({
            type: ActionTypes.UPDATE_POST_SESSION_FEEDBACK_QUESTION,
            role: role,
            text: text
        });
    },


};
