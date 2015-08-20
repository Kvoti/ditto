var React = require('react');
var ReactPropTypes = React.PropTypes;
var Role = require('./Role.react');
var TimeAgo = require('./TimeAgo.react');

// TODO it's not clear what to do about avatars here.
// Some blog post said this was wrong in a parent
//
//     {this.state.blogs.map((blog) => <Blog id={blog.id} />}
//
// where Blog subscribes to the BlogStore. Wrong because the parent
// already has the whole blog from the store so can just pass props
// to Blog rather than each Blog subscribing. Also means Blog can
// be used in other contexts.
//
// The Avatar case is a bit different though. The message doesn't know
// the author's avatar. So ... what's the approach?
// https://www.youtube.com/watch?v=EPpkboSKvPI&feature=youtu.be&t=808
// Maybe it's pass the avatar down from the parent, to save having to
// pass userProfiles in props all the way down???
var AvatarContainer = require('./AvatarContainer.react');

var MessageListItem = React.createClass({

    propTypes: {
        message: ReactPropTypes.object
    },

    render () {
        var message = this.props.message;
        return (
                <div className="media">
                <div className="media-left">
                <AvatarContainer username={message.authorName} size={25} />
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
