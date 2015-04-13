var SettingsAppDispatcher = require('../../../flux-chat/js/dispatcher/ChatAppDispatcher');
var SettingsConstants = require('../constants/SettingsConstants');
var RoleStore = require('../stores/RoleStore');
var SettingsStore = require('../stores/SettingsStore');

var ActionTypes = SettingsConstants.ActionTypes;

function saveRegSettings () {
    API.updateRegFormSettings(
        RoleStore.getCurrent(),
        SettingsStore.getRegFormSettingsForCurrentRole()
    );
}

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
        API.getRegFormSettings(RoleStore.getCurrent());
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

    toggleImpactFootprintItem: function (role, item) {
        if (item.on) {
            SettingsAppDispatcher.dispatch({
                type: ActionTypes.DISABLE_IMPACT_FOOTPRINT_ITEM,
                role: role,
                itemName: item.name
            });
        } else {
            SettingsAppDispatcher.dispatch({
                type: ActionTypes.ENABLE_IMPACT_FOOTPRINT_ITEM,
                role: role,
                itemName: item.name
            });
        }
    },

    toggleImpactFootprintItemContent: function (role, item) {
        if (item.showContent) {
            SettingsAppDispatcher.dispatch({
                type: ActionTypes.DISABLE_IMPACT_FOOTPRINT_ITEM_CONTENT,
                role: role,
                itemName: item.name
            });
        } else {
            SettingsAppDispatcher.dispatch({
                type: ActionTypes.ENABLE_IMPACT_FOOTPRINT_ITEM_CONTENT,
                role: role,
                itemName: item.name
            });
        }
    },

    addRegField: function (role, fieldName) {
        SettingsAppDispatcher.dispatch({
            type: ActionTypes.ENABLE_REG_FIELD,
            role: role,
            fieldName: fieldName
        });
        // TODO what should we do here? Wait for ajax request to complete? If we update
        // the ui optimistically how do we roll back on server error?
        // Also, if we save stuff to the db should we request it back from the db?
        saveRegSettings();
    },
    
    removeRegField: function (role, fieldName) {
        SettingsAppDispatcher.dispatch({
            type: ActionTypes.DISABLE_REG_FIELD,
            role: role,
            fieldName: fieldName
        });
        saveRegSettings();
    },

    addTextField: function (role, questionText) {
        SettingsAppDispatcher.dispatch({
            type: ActionTypes.ADD_TEXT_FIELD,
            role: role,
            questionText: questionText
        });
        saveRegSettings();
    },

    addChoiceField: function (role, questionText, choices) {
        SettingsAppDispatcher.dispatch({
            type: ActionTypes.ADD_CHOICE_FIELD,
            role: role,
            questionText: questionText,
            choices: choices
        });
        saveRegSettings();
    },

    addMultipleChoiceField: function (role, questionText, choices) {
        SettingsAppDispatcher.dispatch({
            type: ActionTypes.ADD_CHOICE_FIELD,
            role: role,
            questionText: questionText,
            choices: choices,
            multiple: true
        });
        saveRegSettings();
    },

    updateChoiceField: function (role, oldName, questionText, choices) {
        SettingsAppDispatcher.dispatch({
            type: ActionTypes.UPDATE_CHOICE_FIELD,
            role: role,
            currentFieldName: oldName,
            questionText: questionText,
            choices: choices
        });
        saveRegSettings();
    },
    
    receiveRegFormSettings: function (role, settings) {
        SettingsAppDispatcher.dispatch({
            type: ActionTypes.RECEIVE_REG_FORM_SETTINGS,
            role: role,
            settings: settings,
        });
    },

};
// TODO fix circ. dependency between api and this
var API = require('../api/api');
