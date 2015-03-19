var ChatThreadActionCreators = require('../actions/ChatThreadActionCreators');
var React = require('react');
var cx = require('react/lib/cx');
var TimeAgo = require('./TimeAgo.react');
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
          'thread-list-item': true,
          'active': thread.id === this.props.currentThreadID
        })}
        onClick={this._onClick}>
        <h5 className="thread-name">{thread.name}</h5>
        <div className="thread-time">
            <TimeAgo when={lastMessage.date} />
            </div>
            <Status user={contact} />
        <div className="thread-last-message">
          {lastMessage.text}
        </div>
      </li>
    );
  },

  _onClick: function() {
    ChatThreadActionCreators.clickThread(this.props.thread.id);
  }

});

module.exports = ThreadListItem;
