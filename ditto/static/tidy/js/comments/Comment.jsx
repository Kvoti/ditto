import React from 'react';

export default class Comment extends React.Component {
    // TODO static propTypes

    render () {
	return (
	    <dl>
		<dt>{this.props.comment.author}</dt>
		<dd>{this.props.comment.comment}</dd>
	    </dl>
	);
    }
}
