var React = require('react/addons');
var update = React.addons.update;
var ChatroomScheduleViewer = require('./ChatroomScheduleViewer.jsx');
var ChatHours = require('./ChatHours.jsx');
var Constants = require('../constants/SettingsConstants');
var SlotStore = require('../stores/SlotStore');
var utils = require('../utils');
var assign = require('object-assign');
var SettingsActionCreators = require('../actions/SettingsActionCreators');

function getStateFromStores (room) {
    return SlotStore.getForRoom(room);
}

var RegularChatroomSchedule = React.createClass({
    getInitialState () {
	return {
	    slots: getStateFromStores(this.props.room),
	    editingSlot: null,
	    pendingSlot: null,
	}
    },
    
    componentDidMount () {
        SlotStore.addChangeListener(this._onChange);
    },

    componentWillUnmount () {
        SlotStore.removeChangeListener(this._onChange);
    },
    
    _onChange () {
	var slots = getStateFromStores(this.props.room);
        this.setState({slots: slots});
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
		day: 0,
		start: 9,
		end: 17,
		isPending: true
	    }
	});
    },

    _renderPendingSlotEditor () {
	var slot = this.state.pendingSlot;
	var overlaps = slot ? this._validatePendingSlot(slot) : [];
	return (
	    <div>
		<div className="form-inline">
		    <div className="form-group">
			<label forHtml="day">Day</label>
			<select id="day" className="form-control" onChange={this._updatePendingSlotDay} value={slot.day}>
			    {Constants.days.map((d, i) => <option key={d} value={i}>{d}</option>)}
			</select>
		    </div>
		    <ChatHours onChange={this._updatePendingSlotTime} start={slot.start} end={slot.end} />
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
    
    _updatePendingSlotDay (e) {
	var value = parseInt(e.target.value, 10);
	var change = {pendingSlot: {}};
	change.pendingSlot['day'] = {$set: value};
	this.setState(update(this.state, change));
    },
    
    _updatePendingSlotTime (key, value) {
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
	this.setState({
	    pendingSlot: null,
	    editingSlot: null
	});
	var newSlot = assign({room: this.props.room}, this.state.pendingSlot);
	delete newSlot.isPending;
	var addSlot;
	if (this._isEditingExistingSlot()) {
	    SettingsActionCreators.updateSlot(newSlot);
	    // replace the currently editing slot with new values
	    //addSlot = {};
	    //ddSlot[this.state.editingSlot] = {$set: newSlot};
	} else {
	    SettingsActionCreators.createSlot(newSlot);
	    // add the new slot to the list of slots
	    //addSlot = {$push: [newSlot]};
	}
	//this.setState(
	    // TODO bit of a gotcha here with trying to use immutable state.
	    // updateSlot above will optimistically update slot store and trigger a change
	    // event, so here we need to set pendingSlot and editingSlot to null in a
	    // function so we get the state at the time of the update *not* the state now.
	    // Wonder what's good/typical practice here? Don't really need to use `update`
	    // I suppose could just setState({pendingSlot: ...}) then there's no problem.
	    // Doesn't this mean a potential problem *everywhere* I've used `update` (as
	    // setState changes are queued and batched)!!?
	    // Think maybe I've misused `update`. If want perf gains should probably go
	    // full hog and use immutability-js.
	    //(state) => {
	    //	update(this.state,
	    //	    {
	    //		pendingSlot: {$set: null},
	    //		editingSlot: {$set: null},
	    //		//slots: addSlot,
	    //	    }
	    //	)
	    //}
	    // 
	//);
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
