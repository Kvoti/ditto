var SettingsAppDispatcher = require('../../../flux-chat/js/dispatcher/ChatAppDispatcher');
var SettingsConstants = require('../constants/SettingsConstants');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var ActionTypes = SettingsConstants.ActionTypes;
var CHANGE_EVENT = 'change';

var _rooms = [];

var ChatroomStore = assign({}, EventEmitter.prototype, {

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
        return _rooms;
    },

    get (slug) {
        var index = _rooms.findIndex(r => r.slug === slug);
        return _rooms[index];
    }

});

ChatroomStore.dispatchToken = SettingsAppDispatcher.register(function(action) {

    switch(action.type) {

    case ActionTypes.RECEIVE_CHATROOMS:
        _rooms = action.rooms;
        ChatroomStore.emitChange();
        break;
        
    case ActionTypes.CREATE_ROOM2:
        // Optimistically add new room
        _rooms.splice(0, 0, action.room);
        ChatroomStore.emitChange();
        break;
        
    case ActionTypes.UPDATE_ROOM:
        // Add room in pending state
        var room = ChatroomStore.get(action.room);
        assign(room, action.update);
        room.isPending = true;
        ChatroomStore.emitChange();
        break;

    case ActionTypes.UPDATE_ROOM_SUCESS:
        var room = ChatroomStore.get(action.room);
        room.isPending = false;
        ChatroomStore.emitChange();
        break;
        
    case ActionTypes.UPDATE_ROOM_FAILURE:
        // TODO
        break;
        
    default:
        // do nothing
    }

});

module.exports = ChatroomStore;
