var React = require('react');
var ReactPropTypes = React.PropTypes;
var Avatar = require('./Avatar.react');
var Role = require('./Role.react');
var TimeAgo = require('./TimeAgo.react');

var MessageListItem = React.createClass({

    propTypes: {
        message: ReactPropTypes.object
    },

    render: function() {
        var message = this.props.message;
        return (
                <div className="media">
                <div className="media-left">
                <Avatar user={message.authorName} size={25} />
                </div>
                <div className="media-body">
                <div className="media-heading clearfix">
                <p style={{float: 'left'}}><small className="messageAuthor"><b>{message.authorName}</b> <i>[<Role user={message.authorName} />]</i></small></p>
                <p style={{float: 'right'}}><small className="messageTimestamp"><TimeAgo when={message.date} /></small></p>
                </div>
                {message.text}
            </div>
            </div>
        );
    }
    
});

module.exports = MessageListItem;
