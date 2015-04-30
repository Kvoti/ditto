var ChatThreadActionCreators = require('../actions/ChatThreadActionCreators');
var React = require('react');
var cx = require('react/lib/cx');
var TimeAgo = require('./TimeAgo.react');
var Avatar = require('./Avatar.react');
var Status = require('./Status.react');
var ChatMessageUtils = require('../utils/ChatMessageUtils');
var LeftRightAlign = require('../../../js/components/LeftRightAlign.jsx');
var ReactPropTypes = React.PropTypes;

var ThreadListItem = React.createClass({

  propTypes: {
    thread: ReactPropTypes.object,
    currentThreadID: ReactPropTypes.string
  },

  render: function() {
    var thread = this.props.thread;
      var lastMessage = thread.lastMessage;
      var contact = ChatMessageUtils.getMessageOther(this.props.thread.id);
    return (
      <li
        className={cx({
          'list-group-item': true,
          'active': thread.id === this.props.currentThreadID
        })}
        onClick={this._onClick}>
            <LeftRightAlign>
            <p><b>{contact}</b> <em>[<Status user={contact} />]</em></p>
            <p className="messageTimestamp"><TimeAgo when={lastMessage ? lastMessage.date : new Date()} /></p>
            </LeftRightAlign>
            {lastMessage && lastMessage.text}
      </li>
    );
  },

  _onClick: function() {
    ChatThreadActionCreators.clickThread(this.props.thread.id);
  }

});

module.exports = ThreadListItem;
