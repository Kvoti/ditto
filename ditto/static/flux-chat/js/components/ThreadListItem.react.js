var ChatThreadActionCreators = require('../actions/ChatThreadActionCreators');
var React = require('react');
var cx = require('react/lib/cx');
var TimeAgo = require('./TimeAgo.react');
var Avatar = require('./Avatar.react');
var Status = require('./Status.react');
var ChatMessageUtils = require('../utils/ChatMessageUtils');

var ReactPropTypes = React.PropTypes;

var ThreadListItem = React.createClass({

  propTypes: {
    thread: ReactPropTypes.object,
    currentThreadID: ReactPropTypes.string
  },

  render: function() {
    var thread = this.props.thread;
      var lastMessage = thread.lastMessage;
      var contact = ChatMessageUtils.getMessageOther(thread.lastMessage);
    return (
      <li
        className={cx({
          'list-group-item': true,
          'active': thread.id === this.props.currentThreadID
        })}
        onClick={this._onClick}>
            <div className="media">
            <div className="media-left">
            <Avatar user={contact} />
        </div>
            <div className="media-body">
            <h4 className="media-heading">{thread.name}</h4>
            <p><TimeAgo when={lastMessage.date} /></p>
            <Status user={contact} />
            {lastMessage.text}
        </div>
        </div>
      </li>
    );
  },

  _onClick: function() {
    ChatThreadActionCreators.clickThread(this.props.thread.id);
  }

});

module.exports = ThreadListItem;
