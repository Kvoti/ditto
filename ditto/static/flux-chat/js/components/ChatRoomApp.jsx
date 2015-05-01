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

function getStateFromStores() {
    return {
        connection: ConnectionStore.get(),
	// TODO maybe push parts needing to know about thread into sub-components?
        thread: ThreadStore.getCurrentID(),
    };
}

var ChatRoomApp = React.createClass({
    
    getInitialState: function() {
        return getStateFromStores();
    },

    componentDidMount: function() {
        ConnectionStore.addChangeListener(this._onChange);
        ThreadStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        ConnectionStore.removeChangeListener(this._onChange);
        ThreadStore.removeChangeListener(this._onChange);
    },

    render: function() {
	// TODO chatroom presence should prob be separate component to whosOnline
	// (whosOnline is supposed to have carousel etc.)
        if (this.state.connection == ChatConstants.connected) {
            return (
		<div className="row">
		    <div className="col-md-6">
			<h3>Chatroom {this.state.thread}</h3>
			<div className="chatroomMessages">
			    <MessageSection heightOffset={300} isGroup={true} />
			</div>
		    </div>
		    <div className="col-md-3">
			<h3>Who&rsquo;s in chatroom {this.state.thread}</h3>
			<div className="chatroomPresence">
			    <WhosOnline stacked={true}/>
			</div>
		    </div>
		    <div className="col-md-3">
			<h3>Other chatrooms</h3>
			<RoomSection />
		    </div>
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

module.exports = ChatRoomApp;
