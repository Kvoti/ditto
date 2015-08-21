import React from 'react';

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
    //////////////////////////////////////////////////////////////////////
    get(APIURL)
      .done(res => {
        camelCaseify(res);
        // TODO only handling one form at the moment
        let form = this._buildForm(res[0]);
        this.setState(
          {
            origForm: {...form.get()},
            // TODO form is not plain object but for now can't figure out how to
            // to this more cleanly
            form
          });
        //////////////////////////////////////////////////////////////////////
      });
  }

  _buildForm(formData) {
    let form = new ManagedObject(formSchema.form);
    // TODO be nice to set this data in one op (to not trigger intermediate state changes)
    // (complication is questions which are not all of same type. could push that down
    // into store? so you just store.set(form); ???) (could have a callback for adding
    // new items that must return the correct manager)
    formData.questions.forEach(q => form.managed.questions.add(
            ...this._getQuestionDataAndManager(q)
    ));
    form.managed.title.set(formData.title);
    form.managed.slug.set(formData.slug);
    form._onChange = () => this.forceUpdate();
    return form;
  }

  render() {
    if (this.state.form) {
      return (
        <Form form={this.state.form} onCancelEdit={this._restoreOriginal} />
      );
    }
    return <p>Loading ...</p>;
  }

  _restoreOriginal = () => {
    console.log('restoring to', this.state.origForm);
    this.setState({form: this._buildForm(this.state.origForm)});
  }

  // TODO this could be a callback in the schema
  _getQuestionDataAndManager(question) {
    const { text, choice, scoregroup } = question;
    let schema;
    if (text) {
      schema = formSchema.textQuestion;
    }
    if (choice) {
      schema = formSchema.choiceQuestion;
    }
    if (scoregroup) {
      schema = formSchema.scoreGroupQuestion;
    }
    // TODO this is a quirk of the API. Each question should just have a type
    // and not these null valued fields
    ['text', 'choice', 'scoregroup'].forEach(p => {
      if (question[p] === null) {
        delete question[p];
      }
    });
    //////////////////////////////////////////////////////////////////////
    return [question, schema];
  }
}
