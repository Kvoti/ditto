var MessageSection = require('./MessageSection.react');
var React = require('react');
var ThreadSection = require('./ThreadSection.react');
var ConnectionStore = require('../stores/ConnectionStore');
var SetMyStatus = require('./SetMyStatus.react');
var WhosOnline = require('./WhosOnline.react');

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
        if (this.state.connection) {
            return (
                    <div className="chatapp">
                    <WhosOnline />
                    <div style={{clear:'both'}}>                    
                    <ThreadSection />
                    <MessageSection />
                    <SetMyStatus />
                    </div>
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
