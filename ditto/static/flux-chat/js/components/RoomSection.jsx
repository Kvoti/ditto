var React = require('react');
var ThreadStore = require('../stores/ThreadStore');
var ChatThreadActionCreators = require('../actions/ChatThreadActionCreators');
var cx = require('react/lib/cx');
var urls = require('../utils/urlUtils');

import { Link } from 'react-router';

function getStateFromStores() {
    return {
        rooms: ThreadStore.getRooms(),
        currentRoomJID: ThreadStore.getCurrentRoomJID(),
    };
}

var RoomSection = React.createClass({
    
    getInitialState: function() {
        return getStateFromStores();
    },

    componentDidMount: function() {
        ThreadStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        ThreadStore.removeChangeListener(this._onChange);
    },

    render: function() {
        var roomListItems = this.state.rooms.map(room => {
	    var roomID = room.split('@')[0];
	    return (
		<Link key={roomID} className="list-group-item" to={urls.chatroom(roomID)}>{Strophe.getNodeFromJid(room)}</Link>
	    );
        });
        return (
	    <div>
		<div className="list-group">
                    {roomListItems}
		</div>
	    </div>
        );
    },

    /**
     * Event handler for 'change' events coming from the stores
     */
    _onChange: function() {
        this.setState(getStateFromStores());
    },

});

module.exports = RoomSection;
