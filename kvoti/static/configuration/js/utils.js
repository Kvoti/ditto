var Constants = require('./constants/SettingsConstants');

var _count = 0;

module.exports = {
    slotsToDayIntervals (slots) {
        // Take a bunch of *ordered* slots with day, start and end and
        // convert into a list of list of time intervals - one for each
        // day. Takes care of wrap around where slots end the following
        // day.
	var days = [for (d of Constants.days) []];
	slots.forEach((s, i) => {
	    var end;
	    var dayIndex = s.day;
	    var day = days[dayIndex];
	    var nextDay = days[(dayIndex + 1) % 7];
	    if (s.end < s.start) {
		end = 24;
	    } else {
		end = s.end
	    }
	    day.push({start: s.start, end: end, isPending: s.isPending, index: i});
	    if (s.end < s.start) {
		nextDay.push({start: 0, end: s.end, isPending: s.isPending, index: i});           
	    }
	});
        return days;
    },

    displayTime (i) {
        var hour;
        if (i === 0) {
	    hour = '12am';
        } else if (i === 12) {
	    hour = '12pm';
        } else if (i < 12) {
	    hour = i + 'am';
        } else {
	    hour = (i - 12) + 'pm';
        }
        return hour;
    },

    uniqueID () {
        return 'id' + _count++;
    },

    ISODateStringToDate (ISODateString) {
        if (!ISODateString) {
            return ISODateString;
        }
        var sinceEpoch = Date.parse(ISODateString);
        var d = new Date();
        d.setTime(sinceEpoch);
        return d;
    },

    addHours (datetime, hours) {
        var sinceEpoch = datetime.getTime();
        sinceEpoch = sinceEpoch + hours * 3600 * 1000;
        return new Date(sinceEpoch);
    }

}    
