var React = require('react');
var StatusStore = require('../stores/StatusStore');
var ChatConstants = require('../constants/ChatConstants');
var ShowStatus = require('./ShowStatus.jsx');

function getStateFromStores() {
    return {
        status: StatusStore.get(),
    };
}

var Status = React.createClass({

    getInitialState: function () {
        return getStateFromStores();
    },

    componentDidMount: function() {
	StatusStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
	StatusStore.removeChangeListener(this._onChange);
    },

    render: function () {
        var status = this.state.status[this.props.user];
        var code;
        var message;
        // TODO this code probably belongs in the store
        if (!status || !status.hasOwnProperty('code')) {
            code = 'offline';
        } else {
            code = status.code || 'online';
            message = status.message;
        }
        ///////
	return <ShowStatus code={code} message={message} />;
    },

    _onChange: function() {
	this.setState(getStateFromStores());
    },
});

module.exports = Status;
