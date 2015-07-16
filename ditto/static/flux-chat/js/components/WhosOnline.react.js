var React = require('react');
var WhosOnlineStore = require('../stores/WhosOnlineStore');
var UserProfileStore = require('../stores/UserProfileStore');
var Avatar = require('./Avatar.react');
var MessageLink = require('../../../js/components/MessageLink.jsx');
var Role = require('./Role.react');

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
	UserProfileStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
	WhosOnlineStore.removeChangeListener(this._onChange);
	UserProfileStore.removeChangeListener(this._onChange);
    },

    render: function () {
        var avatars = this.state.whosOnline.map((user, i) => {
            var avatar = this.state.userProfiles[user] && this.state.userProfiles[user].avatar;
            // TODO defaulting to showing 'Member' is only needed until we sort out setting user role and avatar on account activation
            if (this.props.stacked) { // TODO maybe make a separate component for chatroom presence?
                return (
                        <div style={{height: 50, display: 'table'}} key={user}>
                        <div style={{display: 'table-cell', verticalAlign: 'middle'}}>
                        <MessageLink from={DITTO.user} to={user}>
                        {avatar ? <Avatar username={user} avatar={avatar} size={30} link={false} /> : null}
                        </MessageLink>
                        </div>
                        <div style={{display: 'table-cell', verticalAlign: 'middle', paddingLeft: 5}}>
                        <b>{user}</b> <i>[<Role user={user} />]</i>
                        </div>
                        </div>
                );
            }
            return (
                    <div className="whosOnlineItem" key={user}>
                    <MessageLink from={DITTO.user} to={user}>
                    {avatar ? <Avatar username={user} avatar={avatar} link={false}/> : null}
                    </MessageLink>
                    <small>
                    <p className="username">{user}</p>
                    <p><i>[<Role user={user}/>]</i></p>
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
