var ChatAppDispatcher = require('../dispatcher/ChatAppDispatcher');
var ChatConstants = require('../constants/ChatConstants');
var ChatMessageUtils = require('../utils/ChatMessageUtils');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var ActionTypes = ChatConstants.ActionTypes;
var CHANGE_EVENT = 'change';
var MESSAGE = 'message';
var SESSION = 'session';

var _currentID = null;
var _currentMessageID = null;
var _currentSessionID = null;
var _threads = {};
var _threadType = MESSAGE;

// TODO think more about handling chatrooms vs private chats.
// should maybe separate out chatroom messages from privates messages?
var _roomJIDs = [];
var _currentRoomJID;


var ThreadStore = assign({}, EventEmitter.prototype, {

    message: MESSAGE,

    session: SESSION,
    
    init: function(rawMessages) {
        rawMessages.forEach(function(message) {
            var threadID = message.threadID;
            var thread = _threads[threadID];
            if (thread && thread.lastTimestamp > message.timestamp) {
                return;
            }
	    if (thread) {
                thread.lastMessage = ChatMessageUtils.convertRawMessage(message, _currentID);
	    } else {
		_threads[threadID] = {
                    id: threadID,
                    name: message.threadName,
                    lastMessage: ChatMessageUtils.convertRawMessage(message, _currentID)
		};
	    }
        }, this);

        // if (!_currentID) {
        //     var allChrono = this.getAllChrono();
        //     _currentID = allChrono[allChrono.length - 1].id;
        // }

        if (_currentID && _threads[_currentID] && _threads[_currentID].lastMessage) {
            // TODO need a big sort out of thread handling, this code largely unchangd from facebook's demo app
            // Might be we should separate out pchat and group chat messages. In any case isRead doesn't really work
            // as there's not way (I've found yet) of having that info on the server.
            _threads[_currentID].lastMessage.isRead = true;
        }
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
        var filtered = {};
        for (var id in _threads) {
            if (_threadType === MESSAGE && !_isSession(id) ||
		_threadType === SESSION && _isSession(id)
	       ) {
                filtered[id] = _threads[id];
            }
        }
        return filtered;
    },

    getAllChrono: function() {
        var orderedThreads = [];
        for (var id in this.getAll()) {
            var thread = _threads[id];
            orderedThreads.push(thread);
        }
        orderedThreads.sort(function(a, b) {
          if (!a.lastMessage) {
                return -1;
            } else if (!b.lastMessage) {
                return 1;
            } else if (a.lastMessage.date < b.lastMessage.date) {
                return 1;
            } else if (a.lastMessage.date > b.lastMessage.date) {
                return -1;
            }
            return 0;
        });
        return orderedThreads;
    },

    getCurrentID: function() {
        return _currentID;
    },

    getCurrentChatID: function() {
        return _currentMessageID;
    },
    
    getCurrentSessionID: function() {
        return _currentSessionID;
    },

    getCurrent: function() {
        return this.get(this.getCurrentID());
    },

    getRooms: function () {
        return _roomJIDs;
    },

    getCurrentRoomJID: function () {
        return _currentRoomJID;
    },

    getThreadType: function () {
        return _threadType;
    }
});

function _isSession (threadID) {
    // TODO better way to identify session? (though threadID seems to be all
    // we have to work with)
    return threadID.indexOf("session:") === 0;
}

    
ThreadStore.dispatchToken = ChatAppDispatcher.register(function(action) {

    switch(action.type) {

    case ActionTypes.RECEIVE_RAW_MESSAGES:
        ThreadStore.init(action.rawMessages);
        ThreadStore.emitChange();
        break;

    case ActionTypes.RECEIVE_RAW_PRIVATE_MESSAGE:
        ThreadStore.init([action.rawMessage]);
        ThreadStore.emitChange();
        break;

        // TODO actions below that change thread should mark the last message as read (as CLICK_THREAD
        // used to. CLICK_THREAD is no longer used as we use routing to switch between threads)

    case ActionTypes.RECEIVE_ROOM_LIST:
        _roomJIDs = action.rooms;
        if (!_currentRoomJID) {
            _currentRoomJID = _roomJIDs[0];
            _currentID = Strophe.getNodeFromJid(_currentRoomJID);
            _threads[_currentID] = {
                id: _currentID,
                name: _currentID
            }
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

    case ActionTypes.JOIN_ROOM:
        var roomJID = action.roomJID;
        _threads[Strophe.getNodeFromJid(roomJID)].isJoined = true;
        ThreadStore.emitChange();
        break;
        
    case ActionTypes.LEAVE_ROOM:
        var roomJID = action.roomJID;
        _threads[Strophe.getNodeFromJid(roomJID)].isJoined = false;
        ThreadStore.emitChange();
        break;
        
    case ActionTypes.CHANGE_CHATROOM:
        _currentRoomJID = action.roomJID;
        _currentID = action.roomID
        if (!_threads[_currentID]) {
            _threads[_currentID] = {
                id: _currentID,
                name: _currentID
            }
        }
        ThreadStore.emitChange();
        break;

    case ActionTypes.CHANGE_PRIVATE_CHAT:
        if (_threadType === SESSION && action.threadType === MESSAGE) {
            _currentSessionID = _currentID
        } else if (_threadType === MESSAGE && action.threadType === SESSION) {
            _currentMessageID = _currentID
        }
        _currentID = action.threadID;
        _threadType = action.threadType;
        if (_threadType === SESSION) {
            _currentSessionID = _currentID
        } else {
            _currentMessageID = _currentID
        }
      if (!_threads[_currentID]) {
        console.log('ID',_currentID);
            _threads[_currentID] = {
                id: _currentID,
              name: ChatMessageUtils.getMessageThreadName(_currentID)
            }
        }
        ThreadStore.emitChange();
        break;
        
    case ActionTypes.CHANGE_PRIVATE_CHAT_TYPE:
        if (_threadType === SESSION && action.threadType === MESSAGE) {
            _currentSessionID = _currentID
        } else if (_threadType === MESSAGE && action.threadType === SESSION) {
            _currentMessageID = _currentID
        }
        _currentID = null;
        _threadType = action.threadType;
        if (_threadType === SESSION) {
            _currentSessionID = _currentID
        } else {
            _currentMessageID = _currentID
        }
        //if (!_threads[_currentID]) {
        //    _threads[_currentID] = {
        //        id: _currentID,
        //        name: _currentID
        //    }
        //}
        ThreadStore.emitChange();
        break;

    // Maybe should split this into different store as with unread threads?
    case ActionTypes.END_THREAD:
	_threads[action.threadID].isEnded = true;
	_threads[action.threadID].rating = null;
        ThreadStore.emitChange();
	break;

    case ActionTypes.RECEIVE_END_THREAD:
	_threads[action.threadID].isEnded = true;
	_threads[action.threadID].rating = action.rating;
        ThreadStore.emitChange();
	break;
        
    case ActionTypes.RATE_THREAD:
	_threads[action.threadID].rating = action.rating;
        ThreadStore.emitChange();
	break;

    case ActionTypes.RECEIVE_SESSION_RATING:
	_threads[action.threadID].rating = action.rating;
        ThreadStore.emitChange();
	break;
        
    default:
        // do nothing
    }

});

module.exports = ThreadStore;
