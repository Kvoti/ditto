import React from 'react';
import DelayedInput from '../lib/form/DelayedInput';
import * as schema from 'data-schema/src/schema';
import ControlErrors from 'react-form-builder/src/components/editors/renderer/ControlErrors';
import ControlValidationIcon from 'react-form-builder/src/components/editors/renderer/ControlValidationIcon';
import { controlRowErrorClassNames } from 'react-form-builder/src/components/editors/renderer/utils';

export default class CommentForm extends React.Component {
  static propTypes = {
    onSubmit: React.PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {comment: this._getComment()};
  }

  _getComment() {
    let comment = new schema.ManagedObject(schema.string({isRequired: true}));
    // TODO hacks here to manually call validate, !!NEED to fix ManagedObject constructor!!
    comment.managed.set('');
    comment._isBound = {};
    comment._validate();
    comment._onChange = () => this.forceUpdate();
    //////////////////////////////////////////////////
    return comment;
  }

  render () {
    let errors = this.state.comment.managed.errors;
    return (
      <form onSubmit={this._onSubmit}>
        <div
              className={controlRowErrorClassNames(errors, {'form-group': true})}
              >
          <label
                htmlFor='comment'
                className='control-label'
                >
            {'Comment'}
          </label>
          <div style={{position: 'relative'}}>
	    <DelayedInput
                        id='comment'
                        immediate={this.state.comment.managed.isBound}
			onChange={v => this.state.comment.managed.set(v)}
                        onPendingChange={v => this.state.comment.managed.pend().set(v)}
		        >
	      <textarea
className="form-control"
ref="text"
value={this.state.comment.managed.getPendingOrCurrent()}
	      />
	    </DelayedInput>
            <ControlValidationIcon controlID='comment' errors={errors} />
          </div>
          <ControlErrors errors={errors} />
        </div>
	<input
className="btn btn-success"
disabled={!this.state.comment.isValid() || !this.state.comment.managed.isBound}
type="submit" />
      </form>
    );
  }

  _onSubmit = (e) => {
    e.preventDefault();
    this.props.onSubmit(this.state.comment.managed.get());
    this.setState({comment: this._getComment()});
  }
}
