var React = require('react');
var ChatThreadActionCreators = require('../../flux-chat/js/actions/ChatThreadActionCreators');
var ChatConstants = require('../../flux-chat/js/constants/ChatConstants');

var SessionRating = React.createClass({
    propTypes: {
	sessionID: React.PropTypes.string.isRequired,
	rating: React.PropTypes.number
    },

    getInitialState () {
	return {rating: null};
    },
    
    render: function () {
	var rating;
	if (this._isPending()) {
	    rating = 'Loading rating...';
	} else if (this._isRated()) {
	    rating = <p>You rated this session "{ChatConstants.sessionRatings[this.props.rating]}".</p>;
	} else {
	    rating = (
		<form onSubmit={this._onSubmit}>
		    <p>{DITTO.postSessionQuestion}</p>
		    {ChatConstants.sessionRatings.map((o,i) =>
			<p key={o}>
			<label><input
			checked={i === this.state.rating}
			onChange={this._updateRating.bind(this, i)}
			value={i}
			name="rating"
			type="radio"/> {o}</label>
			</p>
		     )}
			<input disabled={this.state.rating === null} className="btn btn-primary" type="submit" />
		</form>
	    )
	}
	return (
	    <div>
		<p>This session has ended.</p>
		{rating}
	    </div>
	);
    },

    // TODO these methods maybe belong on a rating object or on the ThreadStore?
    _isPending: function () {
	// TODO not at all sure about this. Using `undefined` to mean unknown (ie
	// not loaded from server yet. Whereas as `null` means unrated. Maybe these
	// should be more explicit props?
	return this.props.rating === undefined;
    },

    _isRated: function () {
	return this.props.rating !== null;
    },

    _updateRating (rating) {
	this.setState({rating: rating});
    },
    
    _onSubmit: function (e) {
	e.preventDefault();
	ChatThreadActionCreators.rateThread(this.props.sessionID, this.state.rating);
    }
});

module.exports = SessionRating;
