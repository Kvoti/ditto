var SettingsAppDispatcher = require('../../../flux-chat/js/dispatcher/ChatAppDispatcher');
var SettingsConstants = require('../constants/SettingsConstants');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var ActionTypes = SettingsConstants.ActionTypes;
var CHANGE_EVENT = 'change';

var _rooms = [];
var _current;

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
    },

    getCurrentID () {
        return _current;
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
        room.isPending = true;
        ChatroomStore.emitChange();
        break;

    case ActionTypes.UPDATE_ROOM_SUCESS:
        var room = ChatroomStore.get(action.room);
        // We only commit the change on success. Possibly more normal
        // to optimistically update and then rollback on error but that's
        // a bit trickier.
        assign(room, action.update);
        room.isPending = false;
        ChatroomStore.emitChange();
        break;
        
    case ActionTypes.UPDATE_ROOM_FAILURE:
        var room = ChatroomStore.get(action.room);
        room.isPending = false;
        room.failed = true;
        ChatroomStore.emitChange();
        break;
        
    case ActionTypes.UPDATE_ROOM_REVERT:
        var room = ChatroomStore.get(action.room);
        room.isPending = false;
        room.failed = false;
        ChatroomStore.emitChange();
        break;
        
    case ActionTypes.DELETE_ROOM:
        var room = ChatroomStore.get(action.room);
        room.isDeleting = true;
        ChatroomStore.emitChange();
        break;

    case ActionTypes.DELETE_ROOM_SUCCESS:
        // We only commit the change on success. Possibly more normal
        // to optimistically update and then rollback on error but that's
        // a bit trickier.
        console.log('room deleted successfully');
        var index = _rooms.findIndex(r => r.slug === action.room);
        console.log('removing room', index);
        _rooms.splice(index, 1);
        ChatroomStore.emitChange();
        break;
        
    // TODO case ActionTypes.DELETE_ROOM_FAILURE:
        
    case ActionTypes.CHANGE_ROOM:
        _current = action.room;
        ChatroomStore.emitChange();
        break;
        
    default:
        // do nothing
    }

});

module.exports = ChatroomStore;
