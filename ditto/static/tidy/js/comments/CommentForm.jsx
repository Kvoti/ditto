import React from 'react';
import Validate from '../lib/form/Validate.jsx';

export default class CommentForm extends React.Component {
    static propTypes = {
	onSubmit: React.PropTypes.func.isRequired,
    }

    state = {
	comment: ""
    }
    
    render () {
	return (
	    <form onSubmit={this._onSubmit}>
		<div className="form-group">
		    <Validate isRequired={true} id="comment">
			<textarea
				className="form-control"
				ref="text"
				value={this.state.comment}
				onChange={v => this.setState({comment: v})}
				/>
		    </Validate>
		    <input
			    className="btn btn-success"
			    disabled={!this.state.comment}
			    type="submit" />
		</div>
	    </form>
	);
    }

    _onSubmit = (e) => {
	e.preventDefault();
	this.props.onSubmit(this.state.comment);
	this.setState({comment: ""});
    }
}
