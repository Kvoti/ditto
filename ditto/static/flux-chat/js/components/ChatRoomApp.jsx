// TODO this is mostly the same as ChatApp, should factor out the common bits
var MessageSection = require('./MessageSection.react');
var React = require('react');
var ThreadSection = require('./ThreadSection.react');
var ConnectionStore = require('../stores/ConnectionStore');
var ThreadStore = require('../stores/ThreadStore');
var SetMyStatus = require('./SetMyStatus.react');
var WhosOnline = require('./WhosOnline.react');
var RoomSection = require('./RoomSection.jsx');
var ChatConstants = require('../constants/ChatConstants');
var ChatThreadActionCreators = require('../actions/ChatThreadActionCreators');
var RouteActionCreators = require('../actions/RouteActionCreators.js');
var urls = require('../utils/urlUtils');

import { Router, Route, Navigation } from 'react-router';
import { history } from 'react-router/lib/BrowserHistory';

function getStateFromStores() {
    return {
        connection: ConnectionStore.get(),
	// TODO maybe push parts needing to know about thread into sub-components?
        thread: ThreadStore.getCurrent(),
    };
}

var ChatRoomApp = React.createClass({
    
    getInitialState: function() {
        return getStateFromStores();
    },
    
    componentWillMount () {
        RouteActionCreators.changeChatroom(this.props.location.pathname);
    },

    componentDidMount: function() {
        ConnectionStore.addChangeListener(this._onChange);
        ThreadStore.addChangeListener(this._onChange);
//	TODO not at all sure this is the right place to raise an action.
//	var roomID = this.props.params.id;
//	var roomJID = roomID + '@muc.network1.localhost';
//	ChatThreadActionCreators.clickRoom(roomJID);
    },

    componentWillUnmount: function() {
        ConnectionStore.removeChangeListener(this._onChange);
        ThreadStore.removeChangeListener(this._onChange);
    },

    componentWillReceiveProps (nextProps) {
        RouteActionCreators.changeChatroom(nextProps.location.pathname);
    },
  
  render: function() {
	// TODO chatroom presence should prob be separate component to whosOnline
	// (whosOnline is supposed to have carousel etc.)
        if (this.state.connection == ChatConstants.connected) {
	    if (this.state.thread && !this.state.thread.isJoined) {
		return <p>This chatroom is closed</p>;
	    }
            return (
		<div className="row">
		    <div className="col-md-6">
			<h3>Chatroom {this.state.thread.id}</h3>
			<div className="chatroomMessages">
			    <MessageSection heightOffset={300} isGroup={true} />
			</div>
		    </div>
		    <div className="col-md-3">
			<h3>Who&rsquo;s in chatroom {this.state.thread.id}</h3>
			<div className="chatroomPresence">
			    <WhosOnline stacked={true}/>
			</div>
		    </div>
                    {ThreadStore.getRooms() > 1 ?
		    <div className="col-md-3">
			<h3>Other chatrooms</h3>
			<RoomSection />
		    </div>
                    : null}
		</div>
	    );
        } else if (this.state.connection == ChatConstants.disconnected) {
            return (
                    <div className="chatapp">
                    <p>Disconnected</p>
                    <a href="">Reconnect?</a>
                    </div>
            );
        } else {
            return (
                    <div className="chatapp">
                    connecting...
                    </div>
            );
        }
    },
    
    _onChange: function() {
        this.setState(getStateFromStores());
    }

});

// TODO this is a bit of a hack here too. Want
//     /chatroom/
// to redirect to /chatroom/<mainChatroom>/
// but we have to wait for the list of chatrooms to be loaded from
// the server. Having this 'meta' component got things working but
// not sure its right.
var DefaultChatroom = React.createClass({
    mixins: [Navigation],
    
    componentDidMount: function() {
        ThreadStore.addChangeListener(this._onChange);
    },
    
    componentWillUnmount: function() {
        ThreadStore.removeChangeListener(this._onChange);
    },

    _onChange: function () {
	var rooms = ThreadStore.getRooms();
	if (rooms.length) {
            ThreadStore.removeChangeListener(this._onChange);
	    // TODO complete hack here, call transitionTo asynchronously otherwise
	    // get an error from Dispatcher. Absolutely NO IDEA how to properly
	    // integrate react-router with flux-style app.
	    // One way is to move currentXX state out of the stores, as that info
	    // is encoded in the url. Can then get state by calling store methods
	    // with params from url. Eg.
	    //
	    //     {messages: MessageStore.getForChatroom(this.props.params.chatroom)}
	    //
	    setTimeout(() => {
		this.transitionTo(urls.chatroom(Strophe.getNodeFromJid(rooms[0])));
	    }, 0);
	}
    },
    
    render: function () { return null; }
});


// declare our routes and their hierarchy
var routes = (
    <Router history={history}> 
	<Route path={urls.chatrooms()} component={DefaultChatroom}/>
	<Route path={urls.chatroom(":id")} component={ChatRoomApp}/>
    </Router>
);

module.exports = routes;
