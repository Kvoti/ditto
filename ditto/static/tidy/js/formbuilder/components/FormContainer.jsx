import React from 'react';

import { get } from '../../../../js/request';
import Form from './Form';
import camelCaseify from '../../lib/camelCaseify';
import store from '../store';
import * as formSchema from '../schema';

const APIURL = '/di/api/formbuilder/';

export default class FormContainer extends React.Component {
  /* static propTypes = {
     } */

  state = {
    form: undefined
  }

  componentDidMount() {
    // TODO this should be a proper subscribe
    store._onChange = () =>this.forceUpdate();
    //////////////////////////////////////////////////////////////////////
    get(APIURL)
      .done(res => {
        camelCaseify(res);
        // TODO only handling one form at the moment
        let form = res[0];
        // TODO be nice to set this data in one op (to not trigger intermediate state changes)
        // (complication is questions which are not all of same type. could push that down
        // into store? so you just store.set(form); ???) (could have a callback for adding
        // new items that must return the correct manager)
        form.questions.forEach(q => store.managed.questions.add(
          ...this._getQuestionDataAndManager(q)
        ));
        store.managed.title.set(form.title);
        store.managed.slug.set(form.slug);
        this.setState(
          {
            origForm: store.get(),
            // TODO form is not plain object but for now can't figure out how to
            // to this more cleanly
            form: store
          });
        //////////////////////////////////////////////////////////////////////
      });
  }

  render() {
    if (this.state.form) {
      return (
        <Form form={this.state.form} />
      );
    }
    return <p>Loading ...</p>;
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
