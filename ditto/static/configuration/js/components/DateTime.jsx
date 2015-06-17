// Wrapper around <input type="datetime-local"> to handle converting from/to UTC
// TODO probably want to use a nicer widget than datetime-local. Also, not sure how widely it's supported

var React = require('react/addons');
var _ = require('lodash');

var timezoneOffsetString = getTimezoneOffsetString();

var DateTime = React.createClass({
    render () {
	var value = localeStringFromISOStringInUTC(this.props.value);
	return (
	    <input {...this.props} type="datetime-local" value={value} onChange={this._onChange} />
	);
    },

    _onChange (e) {
	var value = ISOStringInUTCFromLocaleString(e.target.value);
	this.props.onChange(value);
    }

});

function localeStringFromISOStringInUTC (ISOString) {
    console.log('orig time', ISOString);
    var sinceEpoch = Date.parse(ISOString);
    var date = new Date();
    date.setTime(sinceEpoch);
    var year = date.getFullYear();
    var month = _.padLeft(date.getMonth() + 1, 2, 0);
    var day = _.padLeft(date.getDate(), 2, 0);
    var hour = _.padLeft(date.getHours(), 2, 0);
    var minute = _.padLeft(date.getMinutes(), 2, 0);
    var localeString = `${year}-${month}-${day}T${hour}:${minute}`;
    console.log('locale string', localeString);
    return localeString;
}

function ISOStringInUTCFromLocaleString (localeString) {
    var withTZ = `${localeString}${timezoneOffsetString}`;
    console.log('value with tz', withTZ);
    var sinceEpoch = Date.parse(withTZ);
    var UTCDateTime = new Date();
    UTCDateTime.setTime(sinceEpoch);
    return UTCDateTime.toISOString();
}

function getTimezoneOffsetString () {
    var x = new Date();
    var timezoneOffset = x.getTimezoneOffset();
    var sign = timezoneOffset >= 0 ? '-' : '+';
    timezoneOffset = Math.abs(timezoneOffset);
    var timezoneOffsetHours = _.padLeft(Math.floor(timezoneOffset / 60), 2, 0);
    var timezoneOffsetMinutes = _.padLeft(timezoneOffset % 60, 2, 0);
    return `${sign}${timezoneOffsetHours}:${timezoneOffsetMinutes}`;
}

module.exports = DateTime;
