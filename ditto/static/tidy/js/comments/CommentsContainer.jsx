import React from 'react';

import { get, post } from '../../../js/request';
import Comment from './Comment.jsx';
import CommentForm from './CommentForm.jsx';

let commentsAPIURL = '/di/api/comments/';

export default class CommentsContainer extends React.Component {
    state = {
	comments: []
    }

    componentDidMount () {
	get(commentsAPIURL)
	    .done(res => {
		this.setState({comments: res});
	    });
    }
    
    render () {
	return (
	    <div>
		<CommentForm onSubmit={this._onSubmit} />
		{this.state.comments.map(c => <Comment key={c.id} comment={c} />)}
	    </div>
	);
    }

    _onSubmit = (value) => {
	post(
	    commentsAPIURL,
	    {...commentFormData, comment: value}
	).done(res => {
	    this.setState({comments: res});
	}).fail(() => {
	    alert('error saving comment');
	});
    }
}
