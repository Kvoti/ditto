var React = require('react/addons');
var update = React.addons.update;
var Constants = require('../constants/SettingsConstants');
var assign = require('object-assign');
var utils = require('../utils');

var ChatroomScheduleViewer = React.createClass({

    // propTypes;

    getDefaultProps () {
	return {
	    width: 800,
	    rowHeight: 20,
	    dayLabelWidth: 50,
	};
    },
    
    render () {
	console.log('viewing', this.props.slots);
	var groupedSlots = utils.slotsToDayIntervals(this.props.slots);
	var rows = [];
	groupedSlots.forEach((slots, i) => {
	    var day = [this._renderDayLabel(i)];
	    rows.push(day);
	    slots.forEach(slot => {
		day.push(
		    <Slot dayLabelWidth={this.props.dayLabelWidth}
			    rowWidth={this.props.width}
			    start={slot.start}
			    end={slot.end}
		            isPending={slot.isPending}
		            index={slot.index}
		            onClick={this.props.onSlotClick}
			    />
		);
	    })
	});
	
	return (
	    <div>
		{this._renderHeader()}
		{rows.map((row, i) => <Row key={i} width={this.props.width} height={this.props.rowHeight}>{row}</Row>)}
	    </div>
	);
    },

    _renderDayLabel (dayIndex) {
	return (
	    <div style={{
 		float: 'left',
		width: this.props.dayLabelWidth,
		height: this.props.rowHeight,
	    }}>{Constants.days[dayIndex]}</div>
	);
    },
    
    _renderHeader () {
	var labels = [];
	for (var i = 0; i < 24; i += 1) {
	    let hour = utils.displayTime(i);
	    labels.push(
		<div key={i}
			style={{
			       width: 1 / 24 * this.props.width,
			       height: this.props.rowHeight,
			       float: 'left',
			       textAlign: 'center',
			       }}>
		    <small>{hour}</small>
		</div>
	    );
	}
	return (
	    <Row width={this.props.width} height={this.props.rowHeight} style={{
		marginLeft: -0.5 / 24 * this.props.width + this.props.dayLabelWidth,
	    }}>
	    {labels}
	    </Row>
	);
    }
    
});

var Row = React.createClass({
    render () {
	var defaultStyle = {
	    clear: 'both',
	    width: this.props.width,
	    height: this.props.height,
	    marginTop: 3,
	    position: 'relative',
	};
	var style = assign(defaultStyle, this.props.style);
	return (
	    <div style={style}>
		{this.props.children}
	    </div>
	);
    }
});

var Slot = React.createClass({
    // TODO had a quick go at detailed validation, needs a fair bit of tidy up
    // (better error messages, checking start/end are integers etc.)
    propTypes: {
	rowWidth: React.PropTypes.number.isRequired,
	dayLabelWidth: React.PropTypes.number.isRequired,
	start (props, propName, componentName) {
	    var value = props[propName];
	    if (value < 0 || value > 23) {
		return new Error('Start time must be 0..23');
	    }
	},
	end (props, propName, componentName) {
	    var value = props[propName];
	    if (value < 1 || value > 24) {
		return new Error('Start time must be 1..24');
	    }
	    var start = props.start;
	    if (value < start + 1) {
		return new Error('End must be greater than start');
	    }
	},
	isPending: React.PropTypes.bool,
	onClick: React.PropTypes.func
    },

    render () {
	var offset = this.props.rowWidth * this.props.start / 24 + this.props.dayLabelWidth;
	var width = this.props.rowWidth * (this.props.end - this.props.start) / 24;
	return (
	    <div style={{
			position: 'absolute',
                        cursor: 'pointer',
		        left: offset,
			width: width,
			height: '100%',
			backgroundColor: this.props.isPending ? 'orange' : 'blue',
			margin: this.props.isPending ? 2 : 0
	    }}
	    onClick={this._onClick.bind(this, this.props.index)}
	    >
	    </div>
	);
    },

    _onClick (index) {
	console.log('clicked', index);
	this.props.onClick(index);
    },
    
});

module.exports = ChatroomScheduleViewer;
