import React from 'react';
import _ from 'lodash';
import slug from 'slug';

import { get, put } from '../../../../js/request';
import { objToCamelCase, objToUnderscore } from '../../lib/camelCaseify';
import { ManagedObject } from '../../lib/schema/schema';
import * as formSchema from '../schema';
import Form from './Form';

const APIURL = '/di/api/formbuilder/';

export default class FormContainer extends React.Component {
  /* static propTypes = {
     } */

  state = {
    forms: [],
    origForms: [],
    showing: null
  }

  componentDidMount() {
    get(APIURL)
      .done(res => {
        objToCamelCase(res);
        // TODO only handling one form at the moment
        let forms = [];
        let origForms = [];
        res.forEach(formSpec => {
          // TODO form is not plain object but for now can't figure out how to
          // to this more cleanly
          let form = this._buildForm(formSpec);
          forms.push(form);
          // TODO won't need cloneDeep when making sure to use immutable data,
          // can then compare by reference
          origForms.push(_.cloneDeep(form.get()));
        });
        this.setState({ forms, origForms });
      });
  }

  _buildForm(formData) {
    let form = new ManagedObject(formSchema.form);
    form.managed.set(formData);
    form._onChange = () => this.forceUpdate();
    return form;
  }

  render() {
    if (this.state.showing === null) {
      let forms;
      if (this.state.forms.length) {
        forms = this.state.forms.map((form, i) => {
          return (
            <li key={form.managed.slug.get()}>
              <a
                      href="#"
                      onClick={this._showForm.bind(this, i)}
                      >
                {form.managed.title.get()}
              </a>
            </li>
          );
        });
      }
      return (
        <div>
          <ul>
            {forms}
          </ul>
          <div className="form-inline">
            <div className="form-group">
              <label htmlFor="formTitle">
                Title
              </label>
              <input
                      id="formTitle"
                      ref="formTitle"
                      className="form-control"
                      placeholder="Enter a title for the new form"
              />
            </div>
            {' '}
            <button
                    className="btn btn-default"
                    onClick={this._addForm}
                    >
              Add form
            </button>
          </div>
        </div>
      );
    }
    let form = this.state.forms[this.state.showing];
    // TODO keep this container pure and move list stuff in to a FormList component
    return (
      <div>
        <a
                href="#"
                className="btn btn-default"
                onClick={this._listForms}
                >
          Back to form list
        </a>
        <Form form={form}
                isChanged={form.isChanged(this.state.origForms[this.state.showing])}
                isValid={form.isValid()}
                onCancelEdit={this._restoreOriginal}
                onReorder={this._reorder}
                onAddQuestion={this._add}
                onSave={this._save}
        />
      </div>
    );
  }

  _showForm(i) {
    this.setState({showing: i});
  }

  _listForms = () => {
    this.setState({showing: null});
  }

  _addForm = () => {
    let input = React.findDOMNode(this.refs.formTitle);
    let title = input.value;
    if (title) {
      input.value = '';
      let forms = this.state.forms;
      let form = this._buildForm({title: title, slug: slug(title)});
      forms.push(form);
      let origForms = this.state.origForms;
      origForms.push(_.cloneDeep(form.get()));
      this.setState({
        forms: forms,
        origForms: origForms,
        showing: forms.length - 1
      });
    }
  }

  _save = () => {
    let formData = _.cloneDeep(this.state.forms[this.state.showing].get());
    objToUnderscore(formData);
    // TODO handle success/failure!
    put(
      `${APIURL}${formData.slug}/`,
      formData
    );
    let origForms = this.state.origForms;
    origForms[this.state.showing] = _.cloneDeep(this.state.forms[this.state.showing].get());
    this.setState({origForms: origForms});
  }

  _restoreOriginal = () => {
//    console.log('restoring to', this.state.origForm);
    this.setState({form: this._buildForm(this.state.origForm)});
  }

  _add = (e) => {
    let questionType = e.target.value;
    let emptyQuestion;
    if (questionType === 'text') {
      emptyQuestion = {
        text: {}
      };
    }
    if (questionType === 'choice') {
      emptyQuestion = {
        choice: {}
      };
    }
    if (questionType === 'scoregroup') {
      emptyQuestion = {
        scoregroup: {}
      };
    }
    // TODO this default should come from schema
    emptyQuestion.isRequired = false;
    //////////////////////////////////////////////////////////////////////
    this.state.forms[this.state.showing].managed.questions.add(emptyQuestion);
    console.log('adding', e.target.value);
    e.target.value = '';
  }

  _reorder = (reorderedComponents) => {
    this.state.form.managed.questions.reorder(
      [for (c of reorderedComponents) c.props.orderingIndex]
    );
  }
}
