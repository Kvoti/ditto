var React = require('react');
var Panel = require('react-bootstrap/lib/Panel');

var CaseNotes = React.createClass({

    render: function () {
	var role = this.props.role;
	var header = `Editing ‘${role}’ Case Notes`;
	return (
	    <Panel header={header}>
		<em>Case notes appear on a person’s profile page. You can call them something else, and professionals can share them with other roles.</em>
		<p>CASE NOTES [edit title]</p>
	    </Panel>
	);
    }
});

module.exports = CaseNotes;
