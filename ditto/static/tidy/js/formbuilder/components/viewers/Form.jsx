import React from 'react';

import Text from './Text';
import Choice from './Choice';
import ScoreGroup from './ScoreGroup';
import * as schema from '../../../lib/schema/schema';

export default class Form extends React.Component {
  constructor(props) {
    super(props);
    let formSchema = this._getSchema(this.props.form);
    this.state = { form: formSchema };
  }

  render() {
    let formSpec = this.props.form;
    let questionRows = formSpec.managed.questions.members.map(([j, q], i) => {
      return (
        <div
                key={i}
                className="well"
                >
          {this._renderQuestion(q, i)}
        </div>
      );
    });
    return (
          <form onSubmit={this._save}>
            {questionRows}
            <input type="submit" className="btn btn-success" value="Submit"/>
          </form>
    );
  }

  _renderQuestion(question, index) {
    let [onChange, onPendingChange] = this._getChangeHandlers(question, this.state.form.managed[index]);
    let props = {
        ...question.get(),
      key: index,
      ref: index,
      onChange,
      onPendingChange,
      value: this.state.form.managed[index].getPendingOrCurrent(),
      errors: this.state.form.managed[index].errors,
      validateImmediately: this.state.form.managed[index].isBound
    };
    console.log(props);
    return React.createElement(this._getViewComponent(question), props);
  }

  _getViewComponent(question) {
    const { text, choice, scoregroup } = question;
    let viewer;
    if (text) {
      viewer = Text;
    } else if (choice) {
      viewer = Choice;
    } else if (scoregroup) {
      viewer = ScoreGroup;
    }
    return viewer;
  }

  _getSchema(form) {
    let values = new schema.ManagedObject(
      schema.array(),  // TODO shema.tuple or schema.struct better?
      {
        onChange: () => this.forceUpdate()
      }
    );
    form.managed.questions.members.forEach(([j, q], i) => {
      // TODO shouldn't need initial values here
      if (q.text) {
        values.managed.add('', this._getTextSchema(q));
      } else if (q.choice && q.choice.isMultiple.get()) {
        values.managed.add([], this._getChoiceSchema(q));
      } else if (q.choice) {
        values.managed.add('', this._getChoiceSchema(q));
      } else {
        values.managed.add([], this._getScoreGroupSchema(q));
      }
    });
    // TODO this is a hack until I sort out initial values vs data, URGH!
    values._isBound = {};
    values._validate();
    //////////////////////////////////////////////////////////////////////
    console.log('schema', values);
    return values;
  }

  _getViewComponent(question) {
    // TODO static method on _some_ object?
    const { text, choice, scoregroup } = question;
    let viewer;
    if (text) {
      viewer = Text;
    } else if (choice) {
      viewer = Choice;
    } else if (scoregroup) {
      viewer = ScoreGroup;
    }
    return viewer;
  }

  _getChangeHandlers(question, value) {
    // TODO add these as methods on Manager or object that wraps Manager?
    const { text, choice, scoregroup } = question;
    let handler, pendingChangeHandler;
    if (text) {
      handler = (v) => value.set(v);
      pendingChangeHandler = (v) => value.pend().set(v);
    } else if (choice) {
      if (!choice.isMultiple.get()) {
        handler = (e) => value.set(e.target.value);
      } else {
        handler = (e) => {
          if (e.target.checked) {
            value.add(e.target.value);
          } else {
            console.log('removing', option);
            value.removeX(e.target.value);
          }
        };
      }
    } else if (scoregroup) {
      handler = (i, v) => value.setChoice(i, v);
    }
    return [handler, pendingChangeHandler];
  }

  _getTextSchema(question) {
    console.log(question);
    return schema.string({
      // TODO decide on length vs chars
      maxLength: question.text.maxChars === null ? undefined : question.text.maxChars,
      isRequired: question.isRequired.get()
    });
  }

  _getChoiceSchema(question) {
    let factory = question.choice.isMultiple.get() ? schema.multichoice : schema.choice;
    return factory(
      question.choice.options.get(),
      {
        isRequired: question.isRequired.get()
      }
    );
  }

  _getScoreGroupSchema(question) {
    return schema.scoregroup(
      question.scoregroup.labels.get(),
      question.scoregroup.items.members.length,
      {
        isRequired: question.isRequired.get()
      }
    );
  }

  _save = (e) => {
    e.preventDefault();
    this.state.form.validateWithUnbound();
    this.forceUpdate();
    let isValid = this.state.form.isValid();
    console.log('saving', 'valid?', isValid);
  }
}
