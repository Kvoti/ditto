var React = require('react');
var Accordion = require('react-bootstrap/lib/Accordion');
var Panel = require('react-bootstrap/lib/Panel');
var EvaluationItem = require('./Placeholder.jsx');
var Row = require('react-bootstrap/lib/Row');
var Col = require('react-bootstrap/lib/Col');
var CaseNotes = require('./CaseNotes.jsx');

var ITEMS = [
    {
	name: 'Registration',
	edit: 'Edit Registration form',
    },
    {
	name: 'Case Notes',
	edit: 'Edit Case Note form',
	component: CaseNotes,
    },
    {
	name: 'Post-session feedback',
	edit: 'Edit Post-session feedback form',
    },
    {
	name: 'Impact Footprint',
	edit: 'Edit Impact Footprint',
    },
    {
	name: 'Impact Scales',
	edit: 'Edit Impact Scales',
    },
    {
	name: 'Longitudinal surveys',
	edit: 'Edit Longitudinal surveys',
    },
    {
	name: 'Triage Events',
	edit: 'Edit Triage events',
    }
];

function getSettingsComponent (item) {
    for (var i = 0; i < ITEMS.length; i += 1) {
	if (ITEMS[i].name === item) {
	    return ITEMS[i].component;
	}
    }
}

var EvaluationSettings = React.createClass({
    getInitialState: function () {
	return {
	    roles: ['Administrator', 'Counsellor', 'Member'],  // TODO get from props
	    activeKey: 0	    
	}
    },

    handleItemClick: function (item) {
	this.setState({currentSettingsItem: item});
    },

    handleSelect: function (activeKey) {
	this.setState({
	    activeKey: activeKey,
	    currentSettingsItem: null,
	});
    },
    
    render: function () {
	var currentRole = this.state.roles[this.state.activeKey];
	var panels = this.state.roles.map((role, i) => {
	    var items = ITEMS.map((item, j) => {
		return <EvaluationItem key={j} item={item.name} desc={item.edit} handleClick={this.handleItemClick} />
	    });
	    return (
		<Panel key={i} header={role} eventKey={i}>
		    {items}
		</Panel>
	    );
	});
	var settingsComponent;
	if (this.state.currentSettingsItem) {
	    settingsComponent = getSettingsComponent(this.state.currentSettingsItem);
	    if (settingsComponent) {
		settingsComponent = React.createElement(
		    settingsComponent,
		    {role: currentRole}
		)
	    }
	}
	return (
	    <Row>
		<Col md={6}>
		<Accordion activeKey={this.state.activeKey} onSelect={this.handleSelect}>{panels}</Accordion>
	    </Col>
	    <Col md={6}>
    	    {settingsComponent}
		</Col>
	    </Row>
	);
    }
});

module.exports = EvaluationSettings;
