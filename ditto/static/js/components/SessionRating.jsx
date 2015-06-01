var React = require('react');

var SessionRating = React.createClass({
    propTypes: {
	sessionID: React.PropTypes.string.isRequired
    },

    getInitialState: function () {
	return {
	    rating: null,
	    isLoaded: false,
	}
    },

    componentDidMount: function() {
	$.get(this.props.source, function(result) {
	    if (this.isMounted()) {
		this.setState({
		    rating: result,
		    isLoaded: true
		});
	    }
	}.bind(this));
    },
    
    render: function () {
	return (
		<p>This session has ended.</p>
	);
    }
    
});

module.exports = SessionRating;
