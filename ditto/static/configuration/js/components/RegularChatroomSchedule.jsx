var React = require('react/addons');
var update = React.addons.update;
var ChatroomScheduleViewer = require('./ChatroomScheduleViewer.jsx');
var Constants = require('../constants/SettingsConstants');
var utils = require('../utils');
var assign = require('object-assign');

var RegularChatroomSchedule = React.createClass({
    getInitialState () {
	return {
	    type: null,
	    open: null,
	    close: null,
	    slots: [
		{day: 'Mon', start: 6, end: 2},
		{day: 'Tue', start: 9, end: 11},
		{day: 'Fri', start: 10, end: 12},
		{day: 'Fri', start: 14, end: 16},
	    ],
	    editingSlot: null,
	    pendingSlot: null,
	}
    },
    
    render () {
	var slots = this.state.slots.slice();
	if (this.state.pendingSlot) {
	    slots.push(this.state.pendingSlot);
	}
	return (
	    <div>
		{!this.state.pendingSlot ? <p><button className="btn btn-success" onClick={this._addPendingSlot}>Add slot</button></p> : null}
		{this.state.pendingSlot || this._isEditingExistingSlot() ? this._renderPendingSlotEditor() : null}
		<ChatroomScheduleViewer slots={slots} onSlotClick={this._editSlot}/>
	    </div>
	);
    },

    _addPendingSlot () {
	this.setState({
	    pendingSlot: {
		day: 'Mon',
		start: 9,
		end: 17,
		isPending: true
	    }
	});
    },

    _renderPendingSlotEditor () {
	var slot = this.state.pendingSlot;
	console.log('editing', slot);
	var startHours = [], endHours = [];
	var overlaps = slot ? this._validatePendingSlot(slot) : [];
	for (let i = 0; i < 24; i += 1) {
	    startHours.push(i);
	}
	for (let i = slot.start + 1; i <= 24; i += 1) {
	    endHours.push(i);
	}
	for (let i = 1; i < slot.start; i += 1) {
	    endHours.push(i);
	}
	return (
	    <div>
		<div className="form-inline">
		    <div className="form-group">
			<label forHtml="day">Day</label>
			<select id="day" className="form-control" onChange={this._updatePendingSlot.bind(this, 'day')} value={slot.day}>
			    {Constants.days.map(d => <option key={d}>{d}</option>)}
			</select>
		    </div>
		    <div className="form-group">
			<label forHtml="start">Start</label>
			<select id="start" className="form-control" onChange={this._updatePendingSlot.bind(this, 'start')} value={slot.start}>
			    {startHours.map(h => <option value={h} key={h}>{utils.displayTime(h)}</option>)}
			</select>
		    </div>
		    <div className="form-group">
			<label forHtml="end">End</label>
			<select id="end" className="form-control" onChange={this._updatePendingSlot.bind(this, 'end')} value={slot.end}>
			    {endHours.map(h => <option value={h} key={h}>{utils.displayTime(h)}</option>)}
			</select>
		    </div>
		    <button className="btn btn-success" disabled={overlaps.length !== 0} onClick={this._savePendingSlot}>Save</button>
		    <button className="btn btn-default" onClick={this._cancelPendingSlot}>Cancel</button>
		    {this._isEditingExistingSlot() ? <button className="btn btn-danger" onClick={this._deleteSlot}>Delete</button> : null}
		</div>
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

    _isEditingExistingSlot () {
	return this.state.editingSlot !== null;
    },
    
    _updatePendingSlot (key, e) {
	var value = e.target.value;
	if (key === 'start' || 'key' === 'end') {
	    value = parseInt(value, 10);
	}
	var change = {pendingSlot: {}};
	change.pendingSlot[key] = {$set: value};
	this.setState(update(this.state, change));
    },
    
    _validatePendingSlot (slot) {
	// Brute force, check pending slot against all other slots for overlap
	// (probably some clever way to do this [given slots are sorted]...)
	var pending = utils.slotsToDayIntervals([slot]);
	var current = utils.slotsToDayIntervals(this.state.slots);
	var overlaps = [];
	current.forEach((day, dayIndex) => {
	    day.forEach(slot => {
		pending[dayIndex].forEach(pendingSlot => {
		    if (this._overlaps(slot, pendingSlot)) {
			// don't report a slot being edited as overlapping with itself
			if (this.state.editingSlot === null || slot.index !== this.state.editingSlot) {
			    overlaps.push({day: dayIndex, slot: slot});
			}
		    }
		});
	    });
	});
	return overlaps;
    },

    _savePendingSlot () {
	var newSlot = assign({}, this.state.pendingSlot);
	delete newSlot.isPending;
	var addSlot;
	if (this._isEditingExistingSlot()) {
	    // replace the currently editing slot with new values
	    addSlot = {};
	    addSlot[this.state.editingSlot] = {$set: newSlot};
	} else {
	    // add the new slot to the list of slots
	    addSlot = {$push: [newSlot]};
	}
	this.setState(
	    update(this.state,
		{
		    pendingSlot: {$set: null},
		    editingSlot: {$set: null},
		    slots: addSlot,
		}
	    )
	);
    },

    _cancelPendingSlot () {
	this.setState({
	    pendingSlot: null,
	    editingSlot: null,
	});
    },

    _editSlot (index) {
	var pendingSlot = assign({}, this.state.slots[index]);
	pendingSlot.isPending = true;
	this.setState({
	    editingSlot: index,
	    pendingSlot: pendingSlot,
	}); 
    },

    _deleteSlot () {
	this.setState(update(this.state, {
	    slots: {$splice: [[this.state.editingSlot, 1]]},
	    pendingSlot: {$set: null},
	    editingSlot: {$set: null},
	}));
    },
    
    _overlaps (a, b) {
	return (
	    (a.start >= b.start && a.start <= b.end) || // a starts inside b
	    (a.end >= b.start && a.start <= b.end) ||   // a ends inside b
	    (a.start <= b.start && a.end >= b.end)      // a inside b
	);
    }
});

module.exports = RegularChatroomSchedule;
