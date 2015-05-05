var React = require('react');
var ThreadStore = require('../stores/ThreadStore');
var ChatThreadActionCreators = require('../actions/ChatThreadActionCreators');
var cx = require('react/lib/cx');
var Router = require('react-router');
var Link = Router.Link;
var Navigation = Router.Navigation;

function getStateFromStores() {
    return {
        rooms: ThreadStore.getRooms(),
        currentRoomJID: ThreadStore.getCurrentRoomJID(),
    };
}

var RoomSection = React.createClass({
    mixins: [Navigation],
    
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
		<Link key={roomID} className="list-group-item" to="chatroom" params={{id: roomID}}>{room}</Link>
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

    _createRoom: function (e) {
	e.preventDefault();
	var roomName = this.refs.roomName.getDOMNode().value;
	this.refs.roomName.getDOMNode().value = '';
	// TODO check room doesn't already exist
	ChatThreadActionCreators.createRoom(roomName);
	this.transitionTo('chatroom', {id: roomName});
    }
});

module.exports = RoomSection;
