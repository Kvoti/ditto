// TODO not sure whether to split out settings into different stores and actions
var SettingsAppDispatcher = require('../../../flux-chat/js/dispatcher/ChatAppDispatcher');
var SettingsConstants = require('../constants/SettingsConstants');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var RoleStore = require('./RoleStore');

var ActionTypes = SettingsConstants.ActionTypes;
var CHANGE_EVENT = 'change';

var _settings = {};
RoleStore.getAll().map(role => {
    _settings[role] = {
        caseNotes: {
            title: 'CASE NOTES'
        },
        postSessionFeedback: {
            title: 'POST-SESSION FEEDBACK',
            question: 'How useful did you find the support given to you today?',
        },
        impactFootprint: [
            {
                name: 'Conversations',
                on: true,
                showContent: true,
            },
            {
                name: 'Sessions',
                on: true,
                showContent: true,
            },
            {
                name: 'Feedback',
                on: true,
                showContent: true,
            },
            {
                name: 'Blogs',
                on: true,
                showContent: true,
            },
            {
                name: 'Comments',
                on: true,
                showContent: true,
            },
            {
                name: 'Triage',
                on: true,
                showContent: true,
            },
            {
                name: 'Case note',
                on: true,
                showContent: true,
            },
        ]
    }
});

function getImpactFootprintItem (role, name) {
    var settings = _settings[role].impactFootprint;
    // TODO could do with a utils for pulling items from a list by some object property
    for (var i = 0; i < settings.length; i += 1) {
        if (settings[i].name === name) {
            return settings[i];
        }
    }
}

var SettingsStore = assign({}, EventEmitter.prototype, {

    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },

    addChangeListener: function(callback) {
        this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    },

    getCaseNotesSettingsForCurrentRole: function () {
        var role = RoleStore.getCurrent();
        return _settings[role].caseNotes;
    },

    getPostSessionFeedbackSettingsForCurrentRole: function () {
        var role = RoleStore.getCurrent();
        return _settings[role].postSessionFeedback;
    },
    
    getImpactFootprintSettingsForCurrentRole: function () {
        var role = RoleStore.getCurrent();
        return _settings[role].impactFootprint;
    },
    
});

SettingsStore.dispatchToken = SettingsAppDispatcher.register(function(action) {

    switch(action.type) {

    case ActionTypes.UPDATE_CASE_NOTES_TITLE:
        _settings[action.role].caseNotes.title = action.text;
        SettingsStore.emitChange();
        break;
        
    case ActionTypes.UPDATE_POST_SESSION_FEEDBACK_TITLE:
        _settings[action.role].postSessionFeedback.title = action.text;
        SettingsStore.emitChange();
        break;
        
    case ActionTypes.UPDATE_POST_SESSION_FEEDBACK_QUESTION:
        _settings[action.role].postSessionFeedback.question = action.text;
        SettingsStore.emitChange();
        break;

    case ActionTypes.ENABLE_IMPACT_FOOTPRINT_ITEM:
        var item = getImpactFootprintItem(action.role, action.itemName);
        item.on = true;
        SettingsStore.emitChange();
        break;
        
    case ActionTypes.DISABLE_IMPACT_FOOTPRINT_ITEM:
        var item = getImpactFootprintItem(action.role, action.itemName);
        item.on = false;
        SettingsStore.emitChange();
        break;

    case ActionTypes.ENABLE_IMPACT_FOOTPRINT_ITEM_CONTENT:
        var item = getImpactFootprintItem(action.role, action.itemName);
        item.showContent = true;
        SettingsStore.emitChange();
        break;
        
    case ActionTypes.DISABLE_IMPACT_FOOTPRINT_ITEM_CONTENT:
        var item = getImpactFootprintItem(action.role, action.itemName);
        item.showContent = false;
        SettingsStore.emitChange();
        break;
        
    default:
        // do nothing
    }

});

module.exports = SettingsStore;
