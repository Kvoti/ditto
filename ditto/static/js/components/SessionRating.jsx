var React = require('react');

var SessionRating = React.createClass({
    propTypes: {
	sessionID: React.PropTypes.string.isRequired,
	rating: React.PropTypes.number
    },
    
    render: function () {
	var rating;
	if (this._isPending()) {
	    rating = 'Loading rating...';
	} else if (this._isRated()) {
	    rating = <p>Rating is {this.props.rating}</p>;
	} else {
	    rating = <p>TODO form for submitting rating</p>;
	}
	return (
	    <div>
		<p>This session has ended.</p>
		{rating}
	    </div>
	);
    },

    _isPending: function () {
	// TODO not at all sure about this. Using `undefined` to mean unknown (ie
	// not loaded from server yet. Whereas as `null` means unrated. Maybe these
	// should be more explicit props?
	return this.props.rating === undefined;
    },

    _isRated: function () {
	return this.props.rating !== null;
    },
    
});

module.exports = SessionRating;
