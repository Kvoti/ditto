import React from 'react';

export default class CommentForm extends React.Component {
    // TODO static propTypes

    render () {
	return (
	    <form onSubmit={this._onSubmit}>
		<label>Comment:
		    <textarea ref="text"/>
		    <input type="submit" />
		</label>
	    </form>
	);
    }

    _onSubmit = (e) => {
	e.preventDefault();
	let value = React.findDOMNode(this.refs.text).value;
	this.props.onSubmit(value);
    }
}
