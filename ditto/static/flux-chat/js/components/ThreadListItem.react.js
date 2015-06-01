var ChatThreadActionCreators = require('../actions/ChatThreadActionCreators');
var React = require('react');
var cx = require('react/lib/cx');
var TimeAgo = require('./TimeAgo.react');
var Avatar = require('./Avatar.react');
var Status = require('./Status.react');
var ChatMessageUtils = require('../utils/ChatMessageUtils');
var LeftRightAlign = require('../../../js/components/LeftRightAlign.jsx');
var ReactPropTypes = React.PropTypes;
var Router = require('react-router');
var Link = Router.Link;
var Navigation = Router.Navigation;

var ThreadListItem = React.createClass({

  propTypes: {
    thread: ReactPropTypes.object,
      currentThreadID: ReactPropTypes.string,
      threadType: ReactPropTypes.string.isRequired
  },

  render: function() {
    var thread = this.props.thread;
      var lastMessage = thread.lastMessage;
      var contact = ChatMessageUtils.getMessageOther(this.props.thread.id);
    return (
      <Link className={cx({
          'list-group-item': true,
          'active': thread.id === this.props.currentThreadID
      })} to={this.props.threadType} params={{id: thread.id}}>
	    <p>{this.props.thread.name}</p>
            <LeftRightAlign>
            <p><b>{contact}</b> <em>[<Status user={contact} />]</em></p>
            <p className="messageTimestamp"><TimeAgo when={lastMessage ? lastMessage.date : new Date()} /></p>
            </LeftRightAlign>
            {lastMessage && lastMessage.text}
        </Link>
    );
  },

});

module.exports = ThreadListItem;
