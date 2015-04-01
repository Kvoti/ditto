var SettingsAppDispatcher = require('../../../flux-chat/js/dispatcher/ChatAppDispatcher');
var SettingsConstants = require('../constants/SettingsConstants');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var ActionTypes = SettingsConstants.ActionTypes;
var CaseNotes = require('../components/CaseNotes.jsx');

var CHANGE_EVENT = 'change';

var _items = [
    {
	name: 'Registration',
	edit: 'Edit Registration form',
    },
    {
	name: 'Case Notes',
	edit: 'Edit Case Note form',
	component: CaseNotes,
    },
    {
	name: 'Post-session feedback',
	edit: 'Edit Post-session feedback form',
    },
    {
	name: 'Impact Footprint',
	edit: 'Edit Impact Footprint',
    },
    {
	name: 'Impact Scales',
	edit: 'Edit Impact Scales',
    },
    {
	name: 'Longitudinal surveys',
	edit: 'Edit Longitudinal surveys',
    },
    {
	name: 'Triage Events',
	edit: 'Edit Triage events',
    }
];
var _currentItem;

var ItemStore = assign({}, EventEmitter.prototype, {

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
        return _items;
    },

    getCurrent: function () {
        return _currentItem;
    },

    getComponentForCurrent: function () {
        for (var i = 0; i < _items.length; i += 1) {
	    if (_items[i].name === _currentItem) {
	        return _items[i].component;
	    }
        }
    }

});

ItemStore.dispatchToken = SettingsAppDispatcher.register(function(action) {

    switch(action.type) {

    case ActionTypes.CLICK_ITEM:
        _currentItem = action.item;
        ItemStore.emitChange();
        break;
        
    default:
        // do nothing
    }

});

module.exports = ItemStore;
