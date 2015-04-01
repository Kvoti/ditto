var React = require('react');
var Row = require('react-bootstrap/lib/Row');
var Col = require('react-bootstrap/lib/Col');

var Placeholder = React.createClass({

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
		<em><a href="#" onClick={this.props.handleClick.bind(null, this.props.item)}>{this.props.desc}</a></em>
		</Col>
	    </Row>
	);
    }
});

module.exports = Placeholder;
