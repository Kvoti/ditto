import DelayedInput from '../lib/form/DelayedInput';
import * as schema from 'data-schema/src/schema';
import ControlErrors from 'react-form-builder/src/components/editors/renderer/ControlErrors';
import ControlValidationIcon from 'react-form-builder/src/components/editors/renderer/ControlValidationIcon';
import { controlRowErrorClassNames } from 'react-form-builder/src/components/editors/renderer/utils';

var React = require('react');
var RoleAndUserSelect = require('../../../configuration/js/components/RoleAndUserSelect.jsx');


var CaseNoteEditor = React.createClass({
  getInitialState () {
	return {
          caseNote: this._getCaseNote(),
	    shareRoles: this.props.initialShareRoles || [],
	    shareUsers: this.props.initialShareUsers || []
	};
    },

  _getCaseNote() {
    let caseNote = new schema.ManagedObject(schema.shape({
      title: schema.string({isRequired: true}),
      text: schema.string({isRequired: true})
    }));
    // TODO hacks here to manually call validate, need to fix ManagedObject constructor
    caseNote.managed.set({
      title: '',
      text: ''
    });
    caseNote._isBound = {};
    caseNote._validate();
    caseNote._onChange = () => this.forceUpdate();
    //////////////////////////////////////////////////
    console.log('got case note', caseNote.managed.title.isBound, caseNote.managed.title.errors);
    return caseNote;
  },
    
  render () {
    console.log('rendering', this.state.caseNote.managed.text.get());
	return (
	  <div>
            {this._wrap(
		<DelayedInput
			id="title"
                        className="form-control"
                        value={this.state.caseNote.managed.title.getPendingOrCurrent()}
                        immediate={this.state.caseNote.managed.title.isBound}
			onChange={v => this.state.caseNote.managed.title.set(v)}
                        onPendingChange={v => this.state.caseNote.managed.title.pend().set(v)}
		/>,
              'title', 'title', this.state.caseNote.managed.title.errors)}
                {this._wrap(
		<DelayedInput
                        immediate={this.state.caseNote.managed.text.isBound}
			onChange={v => this.state.caseNote.managed.text.set(v)}
                        onPendingChange={v => this.state.caseNote.managed.text.pend().set(v)}
		        >
                  <textarea
                          className="form-control"
                          id="text"
                          value={this.state.caseNote.managed.text.getPendingOrCurrent()}
                  />
                </DelayedInput>,
                  'text', 'text', this.state.caseNote.managed.text.errors)}
		<p>Select any roles and/or users you want to share this note with.</p>
		<RoleAndUserSelect
			onChangeRoles={this._updateSharing.bind(this, 'shareRoles')}
			onChangeUsers={this._updateSharing.bind(this, 'shareUsers')}
	                selectedRoles={this.state.shareRoles}
			users={this.state.shareUsers}
			/>
		<p>
		    <button
			    className="btn btn-success"
			    disabled={!this.state.caseNote.isValid()}
			    onClick={this._onSave}
			    >save</button>
		    <button
			    className="btn btn-default"
			    onClick={this._onCancel}>cancel</button>
		</p>
	    </div>
	);
    },

  _wrap(control, ID, label, errors) {
    return (
      <div
              className={controlRowErrorClassNames(errors, {'form-group': true})}
              >
        <label
                htmlFor={ID}
                className='control-label'
                >
          {label}{' *'}
        </label>
        <div style={{position: 'relative'}}>
          {control}
          <ControlValidationIcon controlID={ID} errors={errors} />
        </div>
        <ControlErrors errors={errors} />
      </div>
    );
  },
  
    _onCancel () {
	this.setState(this.getInitialState());
    },
    
  _updateSharing (key, valueOrEvent) {
    // Urgh, Validate is a legacy thing which I was replacing with DelayedInput. For now, here,
    // we have to figure out if we're passed a value or event (I kept flip-flopping on whether
    // to pass through the original event or the value)
    let value = valueOrEvent.target ? valueOrEvent.target.value : valueOrEvent;
	var update = {};
	update[key] = value;
	this.setState(update);
    },

    _onSave () {
	this.props.onSave(
	    this.state.caseNote.managed.title.get(),
	    this.state.caseNote.managed.text.get(),
	    this.state.shareUsers,
	    this.state.shareRoles
	);
      this.setState({
        caseNote: this._getCaseNote(),
	shareRoles: [],
	shareUsers: []
	});
    }

});


module.exports = CaseNoteEditor;
