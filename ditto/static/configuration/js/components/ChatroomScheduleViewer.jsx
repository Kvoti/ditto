var React = require('react/addons');
var update = React.addons.update;
var Constants = require('../constants/SettingsConstants');

var ChatroomScheduleViewer = React.createClass({

    // propTypes;

    getDefaultProps () {
	return {
	    width: 600,
	    rowHeight: 20,
	    dayLabelWidth: 50,
	};
    },
    
    render () {
	var rows = [for (d of Constants.days) [this._renderDayLabel(d)]];
	this.props.slots.forEach(s => {
	    var width;
	    var offset;
	    var day = rows[Constants.days.indexOf(s.day)];
	    offset = this.props.width * s.start / 24 + this.props.dayLabelWidth;
	    width = this.props.width * ((Math.min(s.end, 24) - s.start) / 24);
	    day.push(
		<div style={{
			    position: 'absolute',
			    left: offset,
			    width: width,
			    height: this.props.rowHeight,
			    backgroundColor: 'blue'
			    }}></div>
	    );
	});
	
	return (
	    <div>
		{this._renderHeader()}
		{rows.map(row => {
		    return (
			<div style={{
			    clear: 'both',
			    width: this.props.width,
			    height: this.props.rowHeight,
			    marginTop: 3,
			    position: 'relative'
			}}>
			{row}
			</div>
		    );
		 })}
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
	    labels.push(
		<div key={i}
			style={{
			       width: 1 / 24 * this.props.width,
			       height: this.props.rowHeight,
			       float: 'left',
			       textAlign: 'center',
			       }}>
		    {i}
		</div>
	    );
	}
	return (
	    <div style={{
			clear: 'both',
			width: this.props.width,
			height: this.props.rowHeight,
			marginLeft: 1.5 / 24 * this.props.width,
			}}>
		{labels}
	    </div>
	);
    }
    
});

module.exports = ChatroomScheduleViewer;
