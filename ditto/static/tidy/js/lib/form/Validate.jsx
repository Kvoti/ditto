// Generic wrapper component for validating form inputs.
//
// Example usage.
//
//     <Validate isRequired={true} typingDelay={500}>
//         <input type="text" value=...>
//     </Validate>
//
// Works with any form input that has a value.
//
// (Note: looked at newforms but seemed very complicated. Possibly a better library
// out there but this simple wrapping approach works for now)

// TODO support all form input elements
// TODO figure out form-level validation
// TODO doesn't work if using LinkedStateMixin
// TODO not sure way of accessing child props is proper react

import classNames from 'classnames';
import React from 'react';

export default class Validate extends React.Component {
    static propTypes = {
	// TODO only require id if wrapped component doesn't have one
	id: React.PropTypes.string.isRequired,
	isRequired: React.PropTypes.bool,
	typingDelay: React.PropTypes.number,
	messages: React.PropTypes.shape({
	    isRequired: React.PropTypes.string
	}),
    }
    
    static defaultProps = {
	typingDelay: 300,  // ms
	// TODO how to merge any overridden messages
	messages: {
	    isRequired: 'Please enter a value',
	}
    }
    
    state = {
	value: this.props.children.props.value,
	errors: null
    }
    
    render () {
	let validationStatus;
	let validationIcon;
	if (this.state.errors !== null) {
	    validationIcon = this.state.errors.length ? 'remove' : 'ok';
	    validationStatus = this.state.errors.length ? 'error' : 'success';
	}
	let wrapperClassNames = classNames(
	    'form-group',
	    {
		'has-feedback': validationStatus,
		[`has-${validationStatus}`]: validationStatus,
	    }
	);
	let glyphClassNames = classNames(
	    'glyphicon',
	    'form-control-feedback',
	    `glyphicon-${validationIcon}`
	);
	let aria = `inputStatus-${this.props.id}`;
	let clone = React.cloneElement(
	    this.props.children,
	    {
		'id': this.props.id,
		'aria-describedby': aria,
		value: this.state.value,
		onChange: this._onChange.bind(this),
		onBlur: this._onBlur.bind(this),
	    }
	);
		
	return (
	    <div className={wrapperClassNames}>
		<label className="control-label" htmlFor={this.props.id}>{this.props.id}</label>
		{clone}
		{validationIcon ? <span className={glyphClassNames} aria-hidden="true"></span> : null}
		{validationIcon ? <span id={aria} className="sr-only">({validationStatus})</span> : null}
		{this.state.errors && this.state.errors.map((e) => <p key={e[0]} className="help-block">{e[1]}</p>)}
	    </div>
	);
    }

    _onChange (e) {
	let value = e.target.value;
	// Only validate immediately if *re-editing* a value
	// TODO or editing an *initially valid* value
	if (this.state.wasBlurred) {
	    this.setState({
		value: value,
	    }, this._pendValidation.bind(this, value));
	} else {
	    this.setState({
		value: value,
	    });
	}
	this.props.children.props.onChange(value);
    }

    _onBlur (e) {
	let value = e.target.value;
	this.setState({
	    value: value,
	    errors: this._validate(value),
	    wasBlurred: true,
	});
    }

    _pendValidation (value) {
	if (this._pendingValidaton) {
	    clearTimeout(this._pendingValidaton);
	}
	this._pendingValidaton = setTimeout(() => {
	    this.setState({errors: this._validate(value)})
	}, this.props.typingDelay);
    }
	    
    _validate (value) {
	let errors = [];
	if (this.props.isRequired && value === "") {
	    errors.push(['isRequired', this._errorMsg('isRequired')]);
	}
	return errors;
    }

    _errorMsg (key) {
	return this.props.messages[key];
    }
}

