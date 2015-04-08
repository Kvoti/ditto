var React = require('react');
var Panel = require('react-bootstrap/lib/Panel');
var SettingsStore = require('../stores/SettingsStore');
var SettingsActionCreators = require('../actions/SettingsActionCreators');
var Row = require('react-bootstrap/lib/Row');
var Col = require('react-bootstrap/lib/Col');

function getStateFromStores () {
    return {
	settings: SettingsStore.getImpactFootprintSettingsForCurrentRole(),
    }
}

var ImpactFootprint = React.createClass({
    
    getInitialState: function () {
	return getStateFromStores();
    },
    
    componentDidMount: function() {
	SettingsStore.addChangeListener(this._onChange);
    },
    
    componentWillUnmount: function() {
	SettingsStore.removeChangeListener(this._onChange);
    },
    
    render: function () {
	var header = `Editing ‘${this.props.role}’ Impact Footprint`;
	var items = this.state.settings.map((item, i) => {
	    var contentToggle;
	    if (item.on) {
		contentToggle = <input type="checkbox" checked={item.showContent} onChange={this._toggleItemContent.bind(this, item)} />;
	    } else {
		contentToggle = <input type="checkbox" checked={item.showContent} readOnly />;
	    }
	    return (
		<div key={i}>
		    <Col md={3}>
		    {item.name}
                </Col>
		<Col md={3}>
		<input type="checkbox" checked={item.on} onChange={this._toggleItem.bind(this, item)} />
		    </Col>
		    <Col md={3}>
		    <em>Show content?</em>
		    </Col>
		    <Col md={3}>
		    {contentToggle}
		    </Col>
		</div>		
	    );
	});
	return (
	    <Panel header={header} bsStyle="primary">
		<p>
		<em>
		    Turn on/off the events you wish to track for ‘{this.props.role}’. The detail or content of the
		    event can also be displayed below the timeline.
		</em>
		</p>
		<Panel header="IMPACT FOOTPRINT">
		    <Row>
			{items}
		    </Row>
		</Panel>
	    </Panel>
	);
    },
    
    _onChange: function() {
        this.setState(getStateFromStores());
    },
    
    _toggleItem: function (item) {
	SettingsActionCreators.toggleImpactFootprintItem(this.props.role, item);
    },
    
    _toggleItemContent: function (item) {
	SettingsActionCreators.toggleImpactFootprintItemContent(this.props.role, item);
    },
});

module.exports = ImpactFootprint;
