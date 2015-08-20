var SettingsAppDispatcher = require('../../../flux-chat/js/dispatcher/ChatAppDispatcher');
var SettingsConstants = require('../constants/SettingsConstants');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var ActionTypes = SettingsConstants.ActionTypes;
var CHANGE_EVENT = 'change';

var _roles = [];
var _currentRole;

var RoleStore = assign({}, EventEmitter.prototype, {

    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },

    addChangeListener: function(callback) {
        this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    },

    getAll: function () {
        return _roles;
    },

    getCurrent: function () {
        return _currentRole;
    }
    
});

RoleStore.dispatchToken = SettingsAppDispatcher.register(function(action) {

    switch(action.type) {

    case ActionTypes.RECEIVE_ROLES:
        _currentRole = action.roles[0];
        _roles = action.roles;
        RoleStore.emitChange();
        break;
        
    case ActionTypes.CLICK_ROLE:
        _currentRole = action.role;
        RoleStore.emitChange();
        break;
        
    default:
        // do nothing
    }

});

module.exports = RoleStore;
