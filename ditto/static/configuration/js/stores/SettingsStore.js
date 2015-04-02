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
        impactFootprint: {
            Conversations: {
                on: true,
                showContent: true,
            },
            Sessions: {
                on: true,
                showContent: true,
            },
            Feedback: {
                on: true,
                showContent: true,
            },
            Blogs: {
                on: true,
                showContent: true,
            },
            Comments: {
                on: true,
                showContent: true,
            },
            Triage: {
                on: true,
                showContent: true,
            },
            'Case note': {
                on: true,
                showContent: true,
            },
        }
    }
});

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
        return _settings[role].postSessionFeedback;
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
        
    default:
        // do nothing
    }

});

module.exports = SettingsStore;
