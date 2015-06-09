var Constants = require('./constants/SettingsConstants');

module.exports = {
    slotsToDayIntervals (slots) {
        // Take a bunch of *ordered* slots with day, start and end and
        // convert into a list of list of time intervals - one for each
        // day. Takes care of wrap around where slots end the following
        // day.
	var days = [for (d of Constants.days) []];
	slots.forEach(s => {
	    var end;
	    var dayIndex = Constants.days.indexOf(s.day);
	    var day = days[dayIndex];
	    var nextDay = days[(dayIndex + 1) % 7];
	    if (s.end < s.start) {
		end = 24;
	    } else {
		end = s.end
	    }
	    day.push({start: s.start, end: end, isPending: s.isPending});
	    if (s.end < s.start) {
		nextDay.push({start: 0, end: s.end, isPending: s.isPending});                    
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
    
}    
