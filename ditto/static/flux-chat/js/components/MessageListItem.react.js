var React = require('react');
var ReactPropTypes = React.PropTypes;
var Avatar = require('./Avatar.react');

var MessageListItem = React.createClass({

    propTypes: {
        message: ReactPropTypes.object
    },

    render: function() {
        var message = this.props.message;
        return (
            <li className="message-list-item">
            <h5 className="message-author-name">
            <Avatar user={message.authorName} size={25} />
            {message.authorName}
            </h5>
            <div className="message-time">
            {message.date.toLocaleTimeString()}
            </div>
            <div className="message-text">{message.text}</div>
            </li>
        );
    }
    
});

module.exports = MessageListItem;
