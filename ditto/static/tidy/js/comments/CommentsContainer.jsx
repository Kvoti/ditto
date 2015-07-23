import React from 'react';
import Comments from './Comments.jsx';
import CommentForm from './CommentForm.jsx';

export default class CommentsContainer extends React.Component {
    // TODO static propTypes

    render () {
	return (
	    <div>
		<Comments {...this.props} />
		<CommentForm  />
	    </div>
	);
    }
}
