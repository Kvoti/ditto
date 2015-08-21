import React from 'react';
import _ from 'lodash';

import { get } from '../../../../js/request';
import Form from './Form';
import camelCaseify from '../../lib/camelCaseify';
import { ManagedObject } from '../../lib/schema/schema';
import * as formSchema from '../schema';

const APIURL = '/di/api/formbuilder/';

export default class FormContainer extends React.Component {
  /* static propTypes = {
     } */

  state = {
    form: undefined
  }

  componentDidMount() {
    get(APIURL)
      .done(res => {
        camelCaseify(res);
        // TODO only handling one form at the moment
        let form = this._buildForm(res[0]);
        this.setState(
          {
            // TODO won't need cloneDeep when making sure to use immutable data,
            // can then compare by reference
            origForm: _.cloneDeep(form.get()),
            // TODO form is not plain object but for now can't figure out how to
            // to this more cleanly
            form
          });
      });
  }

  _buildForm(formData) {
    let form = new ManagedObject(formSchema.form);
    form.managed.set(formData);
    form._onChange = () => this.forceUpdate();
    return form;
  }

  render() {
    if (this.state.form) {
      return (
        <Form form={this.state.form}
                isChanged={this.state.form.isChanged(this.state.origForm)}
                isValid={this.state.form.isValid()}
                onCancelEdit={this._restoreOriginal}
                onReorder={this._reorder}
        />
      );
    }
    return <p>Loading ...</p>;
  }

  _restoreOriginal = () => {
//    console.log('restoring to', this.state.origForm);
    this.setState({form: this._buildForm(this.state.origForm)});
  }

  _reorder = (reorderedComponents) => {
    this.state.form.managed.questions.reorder(
      [for (c of reorderedComponents) c.props.orderingIndex]
    );
    // Simulate a save here (need to add save/cancel for form level operations)
    this.setState({origForm: _.cloneDeep(this.state.form.get())});
  }
}
