var React = require('react');
var timeago = require('timeago');

var TimeAgo = React.createClass({
    
    componentDidMount: function() {
	this.interval = setInterval(this.updateDelta, 60 * 1000);
    },

    componentWillUnmount: function () {
	clearInterval(this.interval);
    },

    updateDelta: function () {
	// TODO this doesn't feel right
	this.setState({});
    },
    
    render: function () {
	var when = this.props.when;
	var delta = timeago(when);
	return (
	    <time dateTime={when.toISOString()}>{delta}</time>
	);
    }
});

module.exports = TimeAgo;
