var React = require('react');

var WhosTyping = React.createClass({

    render: function () {
        if (!this.props.users || this.props.users.length === 0) {
            return null;
        }
        var typing = this.props.users.join(', ');
	return (
                <div>
                {typing} is typing ...
                </div>
        );
    },
    
});

module.exports = WhosTyping;
