var SettingsAppDispatcher = require('../../../flux-chat/js/dispatcher/ChatAppDispatcher');
var SettingsConstants = require('../constants/SettingsConstants');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var ActionTypes = SettingsConstants.ActionTypes;
var CHANGE_EVENT = 'change';

var _creators = [];

var RoomCreatorStore = assign({}, EventEmitter.prototype, {

    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },

    addChangeListener: function(callback) {
        this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    },

    get: function () {
        return _creators;
    },

});

RoomCreatorStore.dispatchToken = SettingsAppDispatcher.register(function(action) {

    switch(action.type) {

    case ActionTypes.RECEIVE_ROOM_CREATORS:
        _creators = action.creators;
        RoomCreatorStore.emitChange();
        break;

    case ActionTypes.UPDATE_ROOM_CREATORS_SUCCESS:
        _creators = action.creators;
        RoomCreatorStore.emitChange();
        break;
        
    default:
        // do nothing
    }

});

module.exports = RoomCreatorStore;
