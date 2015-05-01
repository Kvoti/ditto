var React = require('react');
var ThreadStore = require('../stores/ThreadStore');
var ChatThreadActionCreators = require('../actions/ChatThreadActionCreators');
var cx = require('react/lib/cx');

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
            return (
                <a className={cx({
		    "list-group-item": true,
		    'active': room === this.state.currentRoomJID
		})}
		href="#"
		onClick={this._changeRoom.bind(this, room)}
		key={room}
		>
		{room}
		</a>
            );
        });
        return (
	    <div>
		<div className="list-group">
                    {roomListItems}
		</div>
		<form onSubmit={this._createRoom}>
		    <input type="text" placeholder="Enter room name" ref="roomName" />
		    <input type="submit" value="Create room" />
		</form>
	    </div>
        );
    },

    /**
     * Event handler for 'change' events coming from the stores
     */
    _onChange: function() {
        this.setState(getStateFromStores());
    },

    _changeRoom: function (room, e) {
	e.preventDefault();
	ChatThreadActionCreators.clickRoom(room);
    },

    _createRoom: function (e) {
	e.preventDefault();
	var roomName = this.refs.roomName.getDOMNode().value;
	this.refs.roomName.getDOMNode().value = '';
	// TODO check room doesn't already exist
	ChatThreadActionCreators.createRoom(roomName);
    }
});

module.exports = RoomSection;
