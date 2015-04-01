var React = require('react');
var Row = require('react-bootstrap/lib/Row');
var Col = require('react-bootstrap/lib/Col');

var Placeholder = React.createClass({

    handleClick: function (e) {
	e.preventDefault();
	this.props.handleClick(this.props.item);
    },
    
    render: function () {
	return (
	    <Row>
		<Col md={4}>
		{this.props.item}
		</Col>
		<Col md={2}>
		<input type="checkbox" checked />
		</Col>
		<Col md={6}>
		<a href="#" onClick={this.handleClick}>{this.props.desc}</a>
		</Col>
	    </Row>
	);
    }
});

module.exports = Placeholder;
