import React from 'react';

import { get, post } from '../../../js/request';
import Comment from './Comment.jsx';
import CommentForm from './CommentForm.jsx';

let commentsAPIURL = '/di/api/comments/';

export default class CommentsContainer extends React.Component {
    static propTypes = {
	contentType: React.PropTypes.string.isRequired,
	objectID: React.PropTypes.number.isRequired,  // TODO pos. int
    }
    
    state = {
	comments: []
    }

    componentDidMount () {
	get(commentsAPIURL, {
	    content_type__model: this.props.contentType,
	    object_pk: this.props.objectID,
	})
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
	    {
		comment: value,
		object_pk: String(this.props.objectID),
		content_type: this.props.contentType,
	    }
	).done(res => {
	    this.setState({comments: res});
	}).fail(() => {
	    alert('error saving comment');
	});
    }
}
