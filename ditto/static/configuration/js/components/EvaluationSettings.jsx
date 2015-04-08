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
	items: ItemStore.getAll(),
    }
}

var EvaluationSettings = React.createClass({
    mixins: [RouterMixin],

    routes: {
        '/di/config/evaluation/:role': '_render',
        '/di/config/evaluation/:role/:item': '_render'
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

    handleItemClick: function (item, e) {
	e.preventDefault();
	// TODO fix this ugly path stuff
	// TODO if fix handleClick in mini-router don't need this
	var role;
	var parts = this.state.path.split('/');
	if (parts.length == 6) {
	    role = parts.slice(-2)[0];
	} else {
	    role = parts.slice(-1)[0];
	}
	navigate('/di/config/evaluation/' + role + '/' + item);
    },

    handleSelect: function (activeKey) {
	var role = this.state.roles[activeKey];
	navigate('/di/config/evaluation/' + role);
    },

    render: function () {
	return this.renderCurrentRoute();
    },

    _render: function (role, item) {
	var activeKey = this.state.roles.indexOf(role);
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
	if (typeof item === "string") {
	    // TODO remove url encoding hack!
	    // surely mini-router, or whichever lib it uses, should handle urlencoded characters?
	    item = item.replace('%20', ' ');
	    settingsComponent = ItemStore.getComponentForItem(item);
	    if (settingsComponent) {
		settingsComponent = React.createElement(
		    settingsComponent,
		    {role: role}
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
        this.setState(getStateFromStores());
    }
    
});

module.exports = EvaluationSettings;
