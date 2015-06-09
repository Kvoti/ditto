var React = require('react/addons');
var update = React.addons.update;
var ChatroomScheduleViewer = require('./ChatroomScheduleViewer.jsx');
var Constants = require('../constants/SettingsConstants');
var utils = require('../utils');
var assign = require('object-assign');

var ChatroomSchedule = React.createClass({
    getInitialState () {
	return {
	    open: null,
	    close: null,
	    slots: [
		{day: 'Mon', start: 6, end: 2},
		{day: 'Tue', start: 9, end: 11},
		{day: 'Fri', start: 10, end: 12},
		{day: 'Fri', start: 14, end: 16},
	    ],
	}
    },
    
    render () {
	var slots = this.state.slots.slice();
	if (this.state.addingSlot) {
	    slots.push(this.state.addingSlot);
	}
	return (
	    <div>
		{!this.state.addingSlot ? <p><button onClick={this._addingSlot}>Add slot</button></p> : null}
		{this.state.addingSlot ? this._renderAddSlot() : null}
		<ChatroomScheduleViewer slots={slots} />
	    </div>
	);
    },

    _addingSlot () {
	this.setState({
	    addingSlot: {
		day: 'Mon',
		start: 9,
		end: 17,
		isPending: true
	    }
	});
    },

    _renderAddSlot () {
	var startHours = [], endHours = [];
	var overlaps = this.state.addingSlot ? this._validatePendingSlot() : [];
	for (let i = 0; i < 24; i += 1) {
	    startHours.push(i);
	}
	for (let i = this.state.addingSlot.start + 1; i <= 24; i += 1) {
	    endHours.push(i);
	}
	for (let i = 1; i < this.state.addingSlot.start; i += 1) {
	    endHours.push(i);
	}
	return (
	    <div>Add slot:{' '}
		<label>Day
		    <select onChange={this._updatePending.bind(this, 'day')} value={this.state.addingSlot.day}>
			{Constants.days.map(d => <option key={d}>{d}</option>)}
		    </select>
		</label>
		<label>Start
		    <select onChange={this._updatePending.bind(this, 'start')} value={this.state.addingSlot.start}>
			{startHours.map(h => <option value={h} key={h}>{utils.displayTime(h)}</option>)}
		    </select>
		</label>
		<label>End
		    <select onChange={this._updatePending.bind(this, 'end')} value={this.state.addingSlot.end}>
			{endHours.map(h => <option value={h} key={h}>{utils.displayTime(h)}</option>)}
		    </select>
		</label>
		<button className="btn btn-success" disabled={overlaps.length !== 0} onClick={this._addPendingSlot}>Done</button>
		<button className="btn" onClick={this._cancelPendingSlot}>Cancel</button>
		{overlaps.map(o => {
		    return (
			<p key={[o.day, o.slot.start, o.slot.end].join(',')}>Slot overlaps {Constants.days[o.day]}{' '}
			{utils.displayTime(o.slot.start)} to{' '}
			{utils.displayTime(o.slot.end)}
			</p>
		    );
		 })}
	    </div>
	);
    },

    _updatePending (key, e) {
	var value = e.target.value;
	if (key === 'start' || 'key' === 'end') {
	    value = parseInt(value, 10);
	}
	var pending = this.state.addingSlot;
	var change = {addingSlot: {}};
	change.addingSlot[key] = {$set: value};
	this.setState(update(this.state, change));
    },
    
    _validatePendingSlot () {
	// Brute force, check pending slot against all other slots for overlap
	// (probably some clever way to do this [given slots are sorted]...)
	var pending = utils.slotsToDayIntervals([this.state.addingSlot]);
	var current = utils.slotsToDayIntervals(this.state.slots);
	var overlaps = [];
	current.forEach((day, dayIndex) => {
	    day.forEach(slot => {
		pending[dayIndex].forEach(pendingSlot => {
		    if (this._overlaps(slot, pendingSlot)) {
			overlaps.push({day: dayIndex, slot: slot});
		    }
		});
	    });
	});
	return overlaps;
    },

    _addPendingSlot () {
	var newSlot = assign({}, this.state.addingSlot);
	delete newSlot.isPending;
	this.setState(
	    update(this.state,
		{
		    addingSlot: {$set: null},
		    slots: {$push: [newSlot]},
		}
	    )
	);
    },

    _cancelPendingSlot () {
	this.setState({addingSlot: null});
    },
    
    _overlaps (a, b) {
	return (
	    (a.start >= b.start && a.start <= b.end) || // a starts inside b
	    (a.end >= b.start && a.start <= b.end) ||   // a ends inside b
	    (a.start <= b.start && a.end >= b.end)      // a inside b
	);
    }
});

module.exports = ChatroomSchedule;
