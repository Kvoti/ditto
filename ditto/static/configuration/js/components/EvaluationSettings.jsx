var React = require('react');
var RouterMixin = require('react-mini-router').RouterMixin;
var navigate = require('react-mini-router').navigate;
var Accordion = require('react-bootstrap/lib/Accordion');
var Panel = require('react-bootstrap/lib/Panel');
var EvaluationItem = require('./Placeholder.jsx');
var Row = require('react-bootstrap/lib/Row');
var Col = require('react-bootstrap/lib/Col');
var RoleStore = require('../stores/RoleStore');
var ItemStore = require('../stores/ItemStore');
var SettingsActionCreators = require('../actions/SettingsActionCreators');

function getStateFromStores () {
    return {
	roles: RoleStore.getAll(),
	currentRole: RoleStore.getCurrent(),
	items: ItemStore.getAll(),
	currentItem: ItemStore.getCurrent(),
    }
}

var EvaluationSettings = React.createClass({
    mixins: [RouterMixin],

    routes: {
	//'/': 'home',
        //'/di/config/evaluation/': 'home',
        '/di/config/evaluation/#:role': 'role'
    },
    
    getInitialState: function () {
	return getStateFromStores();
    },

    componentDidMount: function() {
        RoleStore.addChangeListener(this._onChange);
        ItemStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        RoleStore.removeChangeListener(this._onChange);
        ItemStore.removeChangeListener(this._onChange);
    },

    componentWillUpdate: function (nextProps, nextState) {
	console.log(this.state.currentRole, nextState.currentRole);
	navigate('/di/config/evaluation/' + nextState.currentRole, true);
    },
    
    handleItemClick: function (item) {
	SettingsActionCreators.clickItem(item);
    },

    handleSelect: function (activeKey) {
	var role = this.state.roles[activeKey];
	SettingsActionCreators.clickRole(role);
    },

    render: function () {
	//return this.role();
	console.log('rendering', this.state.currentRole);
	return this.renderCurrentRoute();
    },

    home: function () {
	return this.role();
    },
    
    role: function (role) {
	var activeKey = this.state.roles.indexOf(this.state.currentRole);
	var panels = this.state.roles.map((role, i) => {
	    var items = this.state.items.map((item, j) => {
		return <EvaluationItem key={j} item={item.name} desc={item.edit} handleClick={this.handleItemClick} />
	    });
	    return (
		<Panel id={role} key={i} header={role} eventKey={i} bsStyle={activeKey === i ? "primary" : "default"}>
		    {items}
		</Panel>
	    );
	});
	var settingsComponent;
	if (this.state.currentItem) {
	    settingsComponent = ItemStore.getComponentForCurrent();
	    if (settingsComponent) {
		settingsComponent = React.createElement(
		    settingsComponent,
		    {role: this.state.currentRole}
		)
	    }
	}
	return (
	    <Row>
		<Col md={6}>
		<Accordion activeKey={activeKey} onSelect={this.handleSelect}>{panels}</Accordion>
	    </Col>
	    <Col md={6}>
    	    {settingsComponent}
		</Col>
	    </Row>
	);
    },

    _onChange: function() {
	console.log('changed');
        this.setState(getStateFromStores());
    }
    
});

module.exports = EvaluationSettings;
