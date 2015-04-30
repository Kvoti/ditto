var React = require('react');
var WhosOnlineStore = require('../stores/WhosOnlineStore');
var UserProfileStore = require('../stores/UserProfileStore');
var Avatar = require('./Avatar.react');

function getStateFromStores() {
    return {
        whosOnline: WhosOnlineStore.get(),
        userProfiles: UserProfileStore.get(),
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
            var profile = this.state.userProfiles[user];
            // TODO defaulting to showing 'Member' is only needed until we sort out setting user role and avatar on account activation
            if (this.props.stacked) { // TODO maybe make a separate component for chatroom presence?
                return (
                        <div style={{height: 50, display: 'table'}}>
                        <div style={{display: 'table-cell', verticalAlign: 'middle'}}>
                        <Avatar user={user} key={key} size={30} />
                        </div>
                        <div style={{display: 'table-cell', verticalAlign: 'middle', paddingLeft: 5}}>
                        <b>{user}</b> <i>[{profile ? profile.role : 'Member' }]</i>
                        </div>
                        </div>
                );
            }
            return (
                    <div className="whosOnlineItem">
                    <Avatar user={user} key={key} />
                    <small>
                    <p className="username">{user}</p>
                    <p><i>[{profile ? profile.role : 'Member' }]</i></p>
                    </small>
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
