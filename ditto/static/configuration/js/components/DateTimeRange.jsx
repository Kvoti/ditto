var React = require('react/addons');
var DateTime = require('./DateTime.jsx');
var utils = require('../utils');
var Alert = require('react-bootstrap/lib/Alert');

var DateTimeRange = React.createClass({
    propTypes: {
	min: React.PropTypes.object, // date
	max: React.PropTypes.object, // date
	start: React.PropTypes.object, // date
	end: React.PropTypes.object, // date
	minDelta: React.PropTypes.number, // TODO int number of hours?
	onChange: React.PropTypes.func 
    },

    getDefaultProps () {
	return {
	    minDelta: 1,
	}
    },
    
    componentWillMount () {
	this.startID = utils.uniqueID();
	this.endID = utils.uniqueID();
    },
    
    render () {
	var minEnd;
	if (this.props.start) {
	    minEnd = utils.addHours(this.props.start, this.props.minDelta);
	}
	return (
	    <div className="form-inline">
		{this._validate().map(e => <Alert key={e} bsStyle="danger">{e}</Alert>)}
		<div className="form-group">
		    <label htmlFor={this.startID}>Start</label>
		    <DateTime
			    id={this.startID}
			    value={this.props.start}
			    min={this.props.min}
			    onChange={this._onChangeStart} />
		</div>
		<div className="form-group">
		    <label htmlFor={this.endID}>End</label>
		    <DateTime
			    id={this.endID}
			    disabled={!this.props.start}
			    value={this.props.end}
			    min={minEnd}
			    onChange={this._onChangeEnd} />
		</div>
	    </div>
	);
    },

    _validate () {
	var errors = [];
	if (this.props.start && (this.props.end < utils.addHours(this.props.start, this.props.minDelta))) {
	    errors.push('Please select a later end time');
	}
	return errors;
    },
    
    _onChangeStart (start) {
	var end = this.props.end;
	if (start && end && start >= end) {
	    this.props.onChange(start, null);
	} else {
	    this.props.onChange(start, end);
	}
    },

    _onChangeEnd (end) {
	this.props.onChange(this.props.start, end);
    },
    
});

module.exports = DateTimeRange;
