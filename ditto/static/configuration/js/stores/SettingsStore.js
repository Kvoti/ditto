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
    
});

SettingsStore.dispatchToken = SettingsAppDispatcher.register(function(action) {

    switch(action.type) {

    case ActionTypes.UPDATE_CASE_NOTES_TITLE:
        _settings[action.role].caseNotes.title = action.text;
        SettingsStore.emitChange();
        break;
        
    default:
        // do nothing
    }

});

module.exports = SettingsStore;
