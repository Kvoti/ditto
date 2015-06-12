var SettingsAppDispatcher = require('../../../flux-chat/js/dispatcher/ChatAppDispatcher');
var SettingsConstants = require('../constants/SettingsConstants');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var ActionTypes = SettingsConstants.ActionTypes;
var CHANGE_EVENT = 'change';

var _slots = [];

var SlotStore = assign({}, EventEmitter.prototype, {

    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },

    addChangeListener: function(callback) {
        this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    },

    getForRoom: function (slug) {
        console.log('slots for', slug, _slots);
        var slots = [for (s of _slots) if (s.room === slug) s];
        console.log(slots);
        return slots;
    },

});

SlotStore.dispatchToken = SettingsAppDispatcher.register(function(action) {

    switch(action.type) {

    case ActionTypes.RECEIVE_SLOTS:
        _slots = action.slots;
        SlotStore.emitChange();
        break;
        
    case ActionTypes.RECEIVE_CREATE_SLOT_SUCCESS:
        action.slot.id = action.slotID;
        SlotStore.emitChange();
        break;

    case ActionTypes.CREATE_SLOT:
        // Optimistic update: add new slot to ui as it's being saved
        _slots.push(action.slot);
        SlotStore.emitChange();
        break;
        
    case ActionTypes.UPDATE_SLOT:
        // Optimistic update: update slot as it's being saved
        var index = _slots.findIndex(s => s.id === action.slot.id);
        _slots.splice(index, 1, action.slot);
        SlotStore.emitChange();
        break;
        
    case ActionTypes.DELETE_SLOT:
        // Optimistic update: remove slot as it's being deleted via api
        var index = _slots.findIndex(s => s.id === action.slotID);
        _slots.splice(index, 1);
        SlotStore.emitChange();
        break;
        
    default:
        // do nothing
    }

});

module.exports = SlotStore;
