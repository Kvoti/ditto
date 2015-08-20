import React from 'react';

const commonPropTypes = {
    caseNotes: React.PropTypes.arrayOf(
	React.PropTypes.shape({
	    author: React.PropTypes.string.isRequired,
	    created_at: React.PropTypes.string.isRequired, // TODO datetime?
	    title: React.PropTypes.string.isRequired
	})
    )
}

export default commonPropTypes;
