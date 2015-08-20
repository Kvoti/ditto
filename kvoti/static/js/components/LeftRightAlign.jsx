var React = require('react');

var LeftRightAlign = React.createClass({
    render: function () {
	var left = React.cloneElement(this.props.children[0], {style: {float: 'left'}});
	var right = React.cloneElement(this.props.children[1], {style: {float: 'right'}});
	return (
	    <div className="clearfix">
		{left} {right}
	    </div>
	);
    }
});

module.exports = LeftRightAlign;
