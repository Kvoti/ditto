var React = require('react');
var WhosOnlineStore = require('../stores/WhosOnlineStore');
var Avatar = require('./Avatar.react');

function getStateFromStores() {
    return {
        whosOnline: WhosOnlineStore.get(),
    };
}

var WhosOnline = React.createClass({
    getInitialState: function () {
        return getStateFromStores();
    },

    componentDidMount: function() {
	WhosOnlineStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
	WhosOnlineStore.removeChangeListener(this._onChange);
    },

    render: function () {
        var avatars = this.state.whosOnline.map((user, i) => {
            var key = 'online' + i;
            return (
                    <div style={{float:'left'}}>
                    <Avatar user={user} key={key} />
                    {user}
                    </div>
            );
        });
	return (
                <div className="whosOnline">
                {avatars}
            </div>
        );
    },

    _onChange: function() {
	this.setState(getStateFromStores());
    },
});

module.exports = WhosOnline;
