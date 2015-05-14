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

// TODO this is a bit of a hack here too. Want
//     /messages/
// to redirect to /messages/<mostRecentThread>/
// but we have to wait for the messages to be loaded from
// the server. Having this 'meta' component got things working but
// not sure its right.
var DefaultThread = React.createClass({
    mixins: [Navigation],
    
    componentDidMount: function() {
        ThreadStore.addChangeListener(this._onChange);
    },
    
    componentWillUnmount: function() {
        ThreadStore.removeChangeListener(this._onChange);
    },

    _onChange: function () {
        var allChrono = ThreadStore.getAllChrono();
        var latest;
	if (allChrono.length) {
            // TODO this doesn't work. We need to wait until all chat history is
            // loaded so we know which is the most recent thread (in the fb demo
            // chat history is all loaded at once, in this app chats are loaded for each
            // person in the roster, so not in order of most recent messages)
            latest = allChrono[0];
            ThreadStore.removeChangeListener(this._onChange);  // TODO this needed?
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
		this.transitionTo('messages', {id: latest.id})
	    }, 0);
	}
    },
    
    render: function () { return null; }
});


// declare our routes and their hierarchy
var routes = (
    <Route handler={App}>
	<Route path="/di/messages/" handler={DefaultThread}/>
	<Route name="messages" path="/di/messages/:id/" handler={ChatApp}/>
    </Route>
);

module.exports = routes;
