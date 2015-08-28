import React from 'react';

import * as schema from 'data-schema/src/schema';

import Text from './Text';
import Choice from './Choice';
import ScoreGroup from './ScoreGroup';
import { post } from '../../../../../js/request';
import Response from '../response/Response';

export default class Form extends React.Component {
  constructor(props) {
    super(props);
    let formSchema = this._getSchema(this.props.form);
    this.state = {
      form: formSchema,
      isResponding: true
    };
  }

  render() {
    if (!this.state.isResponding) {
      return (
        <div>
          <button
                  className="btn btn-default"
                  onClick={this._closeResponse}
                  >
            Back
          </button>
          <Response
                  questions={this.props.form.managed.questions.get()}
                  responses={this.state.form.get()}
          />
        </div>
      );
    }
                
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
    let props = {
      question,
//      key: index,
      ref: index,
      value: this.state.form.managed[index]
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
        values.managed.add({choice: [], otherText: ''}, this._getChoiceSchema(q));
      } else if (q.choice) {
        values.managed.add({choice: '', otherText: ''}, this._getChoiceSchema(q));
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
    return schema.shape({
      choice: factory(
        question.choice.options.get(),
        {
          isRequired: question.isRequired.get()
        }
      ),
      otherText: schema.string()
    });
  }

  _getScoreGroupSchema(question) {
    return schema.scoregroup(
      question.scoregroup.labels.members.map(([i, m])=> m.label.get()),
      question.scoregroup.items.members.length,
      {
        isRequired: question.isRequired.get()
      }
    );
  }

  _save = (e) => {
    e.preventDefault();
    this.state.form.validateWithUnbound();
    //    this.forceUpdate();
    let isValid = this.state.form.isValid();
    if (isValid) {
      post(
        `/di/api/formbuilder/${this.props.form.managed.slug.get()}/responses/`,
        this.state.form.get()
      );
      this.setState({isResponding: false});
    } else {
      this.forceUpdate();
    }
  }

  _closeResponse = () => {
    this.setState({isResponding: true});
  }
}
