import React from 'react';

export default class Comments extends React.Component {
    // TODO static propTypes

    static defaultProps = {
	comments: []
    }
    
    render () {
	return (
	    <div>
		{this.props.comments.map(c => <Comment comment={c} />)}
	    </div>
	);
    }

}
