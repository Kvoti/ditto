import React from 'react';

export default class CommentForm extends React.Component {
    // TODO static propTypes

    render () {
	return (
	    <form onSubmit={this._onSubmit}>
		<div className="form-group">
		    <label forHtml="comment">Add Comment:</label>
		    <textarea className="form-control" id="comment" ref="text"/>
		    <input className="btn btn-success" type="submit" />
		</div>
	    </form>
	);
    }

    _onSubmit = (e) => {
	e.preventDefault();
	let value = React.findDOMNode(this.refs.text).value;
	this.props.onSubmit(value);
    }
}
