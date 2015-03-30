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
                <h4 className="media-heading">
                {message.authorName} (<Role user={message.authorName} />)
                <small> <TimeAgo when={message.date} /></small>
            </h4>
                {message.text}
            </div>
            </div>
        );
    }
    
});

module.exports = MessageListItem;
