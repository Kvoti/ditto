var React = require('react/addons');
var update = React.addons.update;
var ChatroomScheduleViewer = require('./ChatroomScheduleViewer.jsx');
var Constants = require('../constants/SettingsConstants');

var ChatroomSchedule = React.createClass({
    getInitialState () {
	return {
	    open: null,
	    close: null,
	    slots: [
		{
		    open: new Date(2015,6,8,12),
		    close: new Date(2015,6,8,14),
		}
	    ],
	}
    },
    
    render () {
	return (
	    <div>
		<p><button onClick={this._addSlot}>Add slot</button></p>
		{this.state.addingSlot ? this._renderAddSlot() : null}
		<ChatroomScheduleViewer
			slots={[
			       {day: 'Mon', start: 6, end: 2},
			       {day: 'Tue', start: 9, end: 11},
			       {day: 'Fri', start: 10, end: 22},
			       ]}
			/>
	    </div>
	);
    },

    _addSlot () {
	this.setState({addingSlot: true});
    },

    _renderAddSlot () {
	return (
	    <p>
		<label>Day
		    <select>
			{Constants.days.map(d => <option key={d}>{d}</option>)}
		    </select>
		</label>
		<label>Start <input type="time" /></label>
		<label>End <input type="time" /></label>
		<button>Done</button>
	    </p>
	);
    }
    
});

module.exports = ChatroomSchedule;
