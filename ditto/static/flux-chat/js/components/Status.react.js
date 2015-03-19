var React = require('react');
var StatusStore = require('../stores/StatusStore');
var ChatConstants = require('../constants/ChatConstants');

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
        var verboseStatus;
        if (!status || !status.hasOwnProperty('code')) {
            return <p>Offline</p>;
        } else {
	    verboseStatus = ChatConstants.chatStatus[status.code] || 'Online';
	    return (
	            <p>{verboseStatus} <em>{status.message}</em></p>
	    );
        }
    },

    _onChange: function() {
	this.setState(getStateFromStores());
    },
});

module.exports = Status;
