var React = require('react/addons');
var utils = require('../utils');

var ChatHours = React.createClass({

    propTypes: {
	start: React.PropTypes.number,
	end: React.PropTypes.number,
	onChange: React.PropTypes.func.isRequired,
    },
    
    render () {
	console.log('render', this.props.start, this.props.end);
	var startHours = [];
	var endHours = [];
	var start = this.props.start || 0;
	// TODO prob not right to create unique ids on every render better in componentWillMount?
	var startID = utils.uniqueID();
	var endID = utils.uniqueID();
	for (let i = 0; i < 24; i += 1) {
	    startHours.push(i);
	}
	for (let i = start + 1; i <= 24; i += 1) {
	    endHours.push(i);
	}
	for (let i = 1; i < start; i += 1) {
	    endHours.push(i);
	}
	return (
	    // React needs this wrapping div, so we add display:inline so this can be used in inline forms
	    // (be nice not to need the wrapper element)
	    <div style={{display: 'inline'}}>
		<TimeSelect id={startID} label="Start" hours={startHours} value={this.props.start} onChange={this._handleChange.bind(this, 'start')} />
		<TimeSelect id={endID} label="End" hours={endHours} value={this.props.end} onChange={this._handleChange.bind(this, 'end')} />
	    </div>
	);	    
    },
    
    _handleChange (key, e) {
	var value = parseInt(e.target.value, 10);
	this.props.onChange(key, value);
    }
});

var TimeSelect = React.createClass({
    render () {
	return (
	    <div className="form-group">
		<label forHtml={this.props.id}>{this.props.label}</label>
		<select id={this.props.id} className="form-control" onChange={this.props.onChange} value={this.props.value}>
		    <option value="">---</option>
		    {this.props.hours.map(h => <option value={h} key={h}>{utils.displayTime(h)}</option>)}
		</select>
	    </div>
	);
    }
});

module.exports = ChatHours;
