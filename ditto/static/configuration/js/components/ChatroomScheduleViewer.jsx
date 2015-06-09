var React = require('react/addons');
var update = React.addons.update;
var Constants = require('../constants/SettingsConstants');
var assign = require('object-assign');

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
	var rows = [for (d of Constants.days) [this._renderDayLabel(d)]];
	this.props.slots.forEach(s => {
	    var end;
	    var dayIndex = Constants.days.indexOf(s.day);
	    var day = rows[dayIndex];
	    var nextDay = rows[(dayIndex + 1) % 7];
	    if (s.end < s.start) {
		end = 24;
	    } else {
		end = s.end
	    }
	    day.push(
		<Slot dayLabelWidth={this.props.dayLabelWidth} rowWidth={this.props.width} start={s.start} end={end} />
	    );
	    if (s.end < s.start) {
		nextDay.push(
		    <Slot dayLabelWidth={this.props.dayLabelWidth} rowWidth={this.props.width} start={0} end={s.end} />
		);
	    }
	});
	
	return (
	    <div>
		{this._renderHeader()}
		{rows.map(row => <Row width={this.props.width} height={this.props.rowHeight}>{row}</Row>)}
	    </div>
	);
    },

    _renderDayLabel (dayName) {
	return (
	    <div style={{
 		float: 'left',
		width: this.props.dayLabelWidth,
		height: this.props.rowHeight,
	    }}>{dayName}</div>
	);
    },
    
    _renderHeader () {
	var labels = [];
	for (var i = 0; i < 24; i += 1) {
	    let hour;
	    if (i === 0) {
		hour = '12am';
	    } else if (i === 12) {
		hour = '12pm';
	    } else if (i < 12) {
		hour = i + 'am';
	    } else {
		hour = (i - 12) + 'pm';
	    }
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
	}
    },

    render () {
	var offset = this.props.rowWidth * this.props.start / 24 + this.props.dayLabelWidth;
	var width = this.props.rowWidth * (this.props.end - this.props.start) / 24;
	return (
	    <div style={{
			position: 'absolute',
			left: offset,
			width: width,
			height: '100%',
			backgroundColor: 'blue'
			}}>
	    </div>
	);
    }
});

module.exports = ChatroomScheduleViewer;
