var MessageSection = require('./MessageSection.react');
var React = require('react');
var ThreadSection = require('./ThreadSection.react');
var ConnectionStore = require('../stores/ConnectionStore');
var SetMyStatus = require('./SetMyStatus.react');
var WhosOnline = require('./WhosOnline.react');
var ChatConstants = require('../constants/ChatConstants');

function getStateFromStores() {
    return {
        connection: ConnectionStore.get(),
    };
}

var ChatApp = React.createClass({
    
    getInitialState: function() {
        return getStateFromStores();
    },

    componentDidMount: function() {
        ConnectionStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        ConnectionStore.removeChangeListener(this._onChange);
    },

    render: function() {
        if (this.state.connection == ChatConstants.connected) {
            return (
                    <div className="row">
                    <div className="col-md-3">
                    <h3>My chats</h3>
                    <ThreadSection heightOffset={250} />
                    </div>
                    <div className="col-md-6">
                    <MessageSection heightOffset={270} />
                    </div>
                    <div className="col-md-3">
                    <h3>My Tools</h3>
                    <SetMyStatus />
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

module.exports = ChatApp;
