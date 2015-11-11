var ChatThreadActionCreators = require('../actions/ChatThreadActionCreators');
var React = require('react');
var cx = require('react/lib/cx');
var TimeAgo = require('./TimeAgo.react');
var Avatar = require('./Avatar.react');
var Status = require('./Status.react');
var ChatMessageUtils = require('../utils/ChatMessageUtils');
var LeftRightAlign = require('../../../js/components/LeftRightAlign.jsx');
var ReactPropTypes = React.PropTypes;
var urls = require('../utils/urlUtils');

import { Link } from 'react-router';

var ThreadListItem = React.createClass({

  propTypes: {
    thread: ReactPropTypes.object,
    currentThreadID: ReactPropTypes.string,
    threadType: ReactPropTypes.string.isRequired
  },

  render: function() {
    let contact = this.props.thread.contact;
    let panelIn = this.props.thread.threads.find(t => t.id === this.props.currentThreadID);
    let panelClass = cx({
      'panel-collapse': true,
      'collapse': true,
      'in': panelIn
    });
    return (
      <div className="panel panel-default">
        <div className="panel-heading" role="tab" id={`heading${contact}`}>
          <h4 className="panel-title">
            <a role="button" data-toggle="collapse" data-parent="#accordion" href={`#collapse${contact}`} aria-expanded="true" aria-controls={`collapse${contact}`}>
              {contact} <em>[<Status user={contact} />]</em>
            </a>
          </h4>
        </div>
        <div id={`collapse${contact}`} className={panelClass} role="tabpanel" aria-labelledby="headingOne">
          <ul className="list-group">
            {this.props.thread.threads.map(thread => {
              return (
                <li
key={thread.id}
className={cx({
                  'list-group-item': true,
                'active': thread.id === this.props.currentThreadID
                              })}>
                <Link activeClassName="" to={urls[this.props.threadType](encodeURIComponent(thread.id))}>
	      <p>{thread.name}</p>
              <LeftRightAlign>
                <p>{thread.lastMessage && thread.lastMessage.text}</p>
                <p className="messageTimestamp"><TimeAgo when={thread.lastMessage ? thread.lastMessage.date : new Date()} /></p>
              </LeftRightAlign>
             </Link>
                </li>
              );
        })}
          </ul>
        </div>
      </div>
    );
  },

});

module.exports = ThreadListItem;
