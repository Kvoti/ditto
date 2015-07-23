import React from 'react';

export default class Comment extends React.Component {
    // TODO static propTypes

    render () {
	return (
	    <dl>
		<dt>by:</dt>
		<dd>{this.props.comment.user}</dd>
		<dt>on:</dt>
		<dd>{this.props.comment.submit_date}</dd>
		<dt>comment:</dt>
		<dd>{this.props.comment.comment}</dd>
	    </dl>
	);
    }
}
