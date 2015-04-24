var React = require('react/addons');

var Address = React.createClass({render: function () {}});

Address.Displayer = React.createClass({
    render: function () {
	return (
	    <div>
		<p>Please enter your address</p>
		<p><label>House name or number <input type="text" /></label></p>
		<p><label>Street <input type="text" /></label></p>
		<p><label>Postcode <input type="text" /></label></p>
	    </div>
	);
    }
});

module.exports = Address;
