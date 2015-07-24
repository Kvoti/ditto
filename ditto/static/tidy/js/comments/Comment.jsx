import React from 'react';
import TimeAgo from '../../../flux-chat/js/components/TimeAgo.react';

export default class Comment extends React.Component {
    // TODO static propTypes

    render () {
	return (
	    <dl>
		<dt>by:</dt>
		<dd>{this.props.comment.user}</dd>
		<dt>on:</dt>
		<dd><TimeAgo when={this.props.comment.submit_date}/></dd>
		<dt>comment:</dt>
		<dd>{this.props.comment.comment}</dd>
	    </dl>
	);
    }
}
