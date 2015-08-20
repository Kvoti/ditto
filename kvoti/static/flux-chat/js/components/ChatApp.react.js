var MessageSection = require('./MessageSection.react');
var React = require('react');
var ThreadSection = require('./ThreadSection.react');
var ConnectionStore = require('../stores/ConnectionStore');
var ThreadStore = require('../stores/ThreadStore');
var SetMyStatus = require('./SetMyStatus.react');
var WhosOnline = require('./WhosOnline.react');
var ChatConstants = require('../constants/ChatConstants');
var SessionManager = require('../../../js/components/SessionManager.jsx');
var RouteActionCreators = require('../actions/RouteActionCreators.js');
var urls = require('../utils/urlUtils');

import { Router, Route } from 'react-router';
import { history } from 'react-router/lib/BrowserHistory';

function getStateFromStores() {
    return {
        connection: ConnectionStore.get(),
    };
}

var ChatApp = React.createClass({

    getInitialState: function() {
        return getStateFromStores();
    },

    componentWillMount () {
        RouteActionCreators.changePrivateChat(this.props.location.pathname);
    },
    
    componentDidMount: function() {
        ConnectionStore.addChangeListener(this._onChange);
    },
    
    componentWillReceiveProps (nextProps) {
        RouteActionCreators.changePrivateChat(nextProps.location.pathname);
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


// declare our routes and their hierarchy
var routes = (
    <Router history={history}>
	<Route path={urls.messages()} component={ChatApp}/>
	<Route path={urls.message(":id")} component={ChatApp}/>
        <Route path={urls.sessions()} component={ChatApp}/>
	<Route path={urls.session(":id")} component={ChatApp}/>
    </Router>
);

module.exports = routes;
