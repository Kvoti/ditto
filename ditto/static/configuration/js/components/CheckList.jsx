var React = require('react/addons');
var update = React.addons.update;
var Accordion = require('react-bootstrap/lib/Accordion');


var CheckList = React.createClass({
    render () {
	return (
	    <div>
		{this.props.items.map(r => {
		    return (
			<p key={r}>
			    <label>
				<input
					onChange={this._toggleItem.bind(this, r)}
					checked={this.props.selected.indexOf(r) !== -1}
					type="checkbox" /> {r}
			    </label>
			</p>
		    );
		 })}
	    </div>
	);
    },
    
    _toggleItem (item) {
	var i = this.props.selected.indexOf(item);
	var selected = this.props.selected.slice();
	if (i === -1) {
	    selected.push(item);
	} else {
	    selected.splice(i, 1);
	}
	this.props.onChange(selected);
    }
    
});

module.exports = CheckList;
