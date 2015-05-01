var ChatAppDispatcher = require('../dispatcher/ChatAppDispatcher');
var ChatConstants = require('../constants/ChatConstants');
var ChatMessageUtils = require('../utils/ChatMessageUtils');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var ChatWebAPIUtils = require('../utils/ChatWebAPIUtils');

var ActionTypes = ChatConstants.ActionTypes;
var CHANGE_EVENT = 'change';

var _currentID = null;
var _threads = {};
// TODO think more about handling chatrooms vs private chats.
// should maybe separate out chatroom messages from privates messages?
var _roomJIDs = [];
var _currentRoomJID;


var ThreadStore = assign({}, EventEmitter.prototype, {

    init: function(rawMessages) {
        rawMessages.forEach(function(message) {
            var threadID = message.threadID;
            var thread = _threads[threadID];
            if (thread && thread.lastTimestamp > message.timestamp) {
                return;
            }
            _threads[threadID] = {
                id: threadID,
                name: message.threadName,
                lastMessage: ChatMessageUtils.convertRawMessage(message, _currentID)
            };
        }, this);

        if (!_currentID) {
            var allChrono = this.getAllChrono();
            _currentID = allChrono[allChrono.length - 1].id;
        }

        _threads[_currentID].lastMessage.isRead = true;
    },

    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },

    /**
     * @param {function} callback
     */
    addChangeListener: function(callback) {
        this.on(CHANGE_EVENT, callback);
    },

    /**
     * @param {function} callback
     */
    removeChangeListener: function(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    },

    /**
     * @param {string} id
     */
    get: function(id) {
        return _threads[id];
    },

    getAll: function() {
        return _threads;
    },

    getAllChrono: function() {
        var orderedThreads = [];
        for (var id in _threads) {
            var thread = _threads[id];
            orderedThreads.push(thread);
        }
        orderedThreads.sort(function(a, b) {
            if (!a.lastMessage) {
                return -1;
            } else if (!b.lastMessage) {
                return 1;
            } else if (a.lastMessage.date < b.lastMessage.date) {
                return -1;
            } else if (a.lastMessage.date > b.lastMessage.date) {
                return 1;
            }
            return 0;
        });
        return orderedThreads;
    },

    getCurrentID: function() {
        return _currentID;
    },

    getCurrent: function() {
        return this.get(this.getCurrentID());
    },

    getRooms: function () {
        return _roomJIDs;
    },

    getCurrentRoomJID: function () {
        return _currentRoomJID;
    }
});

ThreadStore.dispatchToken = ChatAppDispatcher.register(function(action) {

    switch(action.type) {

    case ActionTypes.CLICK_THREAD:
        _currentID = action.threadID;
        _threads[_currentID].lastMessage.isRead = true;
        ThreadStore.emitChange();
        break;
        
    case ActionTypes.CREATE_THREAD:
        _currentID = action.threadID;
        _threads[_currentID] = {
            id: action.threadID,
            name: action.threadID
        }
        ThreadStore.emitChange();
        break;

    case ActionTypes.RECEIVE_RAW_MESSAGES:
        ThreadStore.init(action.rawMessages);
        ThreadStore.emitChange();
        break;

    case ActionTypes.RECEIVE_RAW_PRIVATE_MESSAGE:
        ThreadStore.init([action.rawMessage]);
        ThreadStore.emitChange();
        break;

    case ActionTypes.RECEIVE_ROOM_LIST:
        _roomJIDs = action.rooms;
        if (!_currentRoomJID) {
            _currentRoomJID = _roomJIDs[0];
            _currentID = Strophe.getNodeFromJid(_currentRoomJID);
            _threads[_currentID] = {
                id: _currentID,
                name: _currentID
            }
            ChatWebAPIUtils.joinChatroom(_currentRoomJID);  // TODO not sure about api call in store
        }
        ThreadStore.emitChange();
        break;

    case ActionTypes.CLICK_ROOM:
        var roomJID = action.roomJID;
        _currentRoomJID = roomJID;
        _currentID = Strophe.getNodeFromJid(roomJID);
        if (!_threads[_currentID]) {
            _threads[_currentID] = {
                id: _currentID,
                name: _currentID
            }
            ChatWebAPIUtils.joinChatroom(_currentRoomJID);  // TODO not sure about api call in store
        }
        ThreadStore.emitChange();
        break;

    // TODO factor out common room code
    case ActionTypes.CREATE_ROOM:
        var roomJID = action.roomJID;
        _roomJIDs.push(roomJID);
        _currentRoomJID = roomJID;
        _currentID = Strophe.getNodeFromJid(roomJID);
        _threads[_currentID] = {
            id: _currentID,
            name: _currentID
        }
        ThreadStore.emitChange();
        break;
        
    default:
        // do nothing
    }

});

module.exports = ThreadStore;
