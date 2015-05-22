var MessageSection = require('./MessageSection.react');
var React = require('react');
var ThreadSection = require('./ThreadSection.react');
var ConnectionStore = require('../stores/ConnectionStore');
var ThreadStore = require('../stores/ThreadStore');
var SetMyStatus = require('./SetMyStatus.react');
var WhosOnline = require('./WhosOnline.react');
var ChatConstants = require('../constants/ChatConstants');
var Router = require('react-router');
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;
var Navigation = Router.Navigation;
var SessionManager = require('../../../js/components/SessionManager.jsx');

function getStateFromStores() {
    return {
        connection: ConnectionStore.get(),
    };
}

var ChatApp = React.createClass({
    mixins: [Navigation],
    
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
                    <ThreadSection heightOffset={250} />
                    </div>
                    <div className="col-md-6">
                    <MessageSection heightOffset={230} />
                    <SessionManager />
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

// TODO this is just cut and paste from the hacky routing stuff for the chatrooms
var App = React.createClass({
    render () {
	return (
	    <div>
		<RouteHandler/>
	    </div>
	)
    }
});

// declare our routes and their hierarchy
var routes = (
    <Route handler={App}>
	<Route name="messagesHome" path="/di/messages/" handler={ChatApp}/>
	<Route name="messages" path="/di/messages/:id/" handler={ChatApp}/>
	<Route name="sessionsHome" path="/di/sessions/" handler={ChatApp}/>
	<Route name="sessions" path="/di/sessions/:id/" handler={ChatApp}/>
    </Route>
);

module.exports = routes;
