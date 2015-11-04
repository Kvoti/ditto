// Wrapper around <input type="datetime-local"> to handle converting from/to UTC
// TODO probably want to use a nicer widget than datetime-local. Also, not sure how widely it's supported

var React = require('react/addons');
import padLeft from 'lodash/string/padLeft';

var timezoneOffsetString = getTimezoneOffsetString();

var DateTime = React.createClass({
    propTypes: {
	min: React.PropTypes.object, // date
	max: React.PropTypes.object, // date
	value: React.PropTypes.object, // date
	onChange: React.PropTypes.func 
    },
    
    render () {
	var localeDatetimeStrings = {};
	['min', 'max', 'value'].forEach(k => {
	    let datetime = this.props[k];
	    if (datetime) {
		localeDatetimeStrings[k] = localeStringFromDate(this.props[k]);
	    } else {
		localeDatetimeStrings[k] = datetime;
	    }
	});
	return (
	    <input {...this.props}
		    ref="input"
		    type="datetime-local"
		    value={localeDatetimeStrings.value}
		    min={localeDatetimeStrings.min}
		    max={localeDatetimeStrings.max}
		    onChange={this._onChange}
		    />
	);
    },

    _onChange (e) {
	var value = DateFromLocaleString(e.target.value);
	this.props.onChange(value);
    },

});

function localeStringFromDate (date) {
    console.log('converting', date);
    var year = date.getFullYear();
    var month = padLeft(date.getMonth() + 1, 2, 0);
    var day = padLeft(date.getDate(), 2, 0);
    var hour = padLeft(date.getHours(), 2, 0);
    var minute = padLeft(date.getMinutes(), 2, 0);
    var localeString = `${year}-${month}-${day}T${hour}:${minute}`;
    console.log('locale string', localeString);
    return localeString;
}

function DateFromLocaleString (localeString) {
    if (!localeString) {
	return localeString;
    }
    var withTZ = `${localeString}${timezoneOffsetString}`;
    var sinceEpoch = Date.parse(withTZ);
    var UTCDateTime = new Date();
    UTCDateTime.setTime(sinceEpoch);
    return UTCDateTime;
}

function getTimezoneOffsetString () {
    var x = new Date();
    var timezoneOffset = x.getTimezoneOffset();
    var sign = timezoneOffset >= 0 ? '-' : '+';
    timezoneOffset = Math.abs(timezoneOffset);
    var timezoneOffsetHours = padLeft(Math.floor(timezoneOffset / 60), 2, 0);
    var timezoneOffsetMinutes = padLeft(timezoneOffset % 60, 2, 0);
    return `${sign}${timezoneOffsetHours}:${timezoneOffsetMinutes}`;
}

module.exports = DateTime;
