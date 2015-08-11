import React from 'react';
import Question from './Question';
import _ from 'lodash';  // TODO switch to ImmutableJS?
import * as schema from '../../lib/schema/schema';
import DelayedControl from '../../lib/form/DelayedControl';

//export default class Form extends React.Component {
/* constructor(props) {
   super(props);
   this.state = {
   texts: ['', '', '']
   };
   this.q = new schema.Question(
   {
   texts: schema.array(
   schema.string({
   maxLength: 10,
   isRequired: true
   }),
   {
   unique: true
   }
   )
   },
   {initial: this.state}
   );
   }
   
   render() {
   return (
   <div>
   {this.q.texts.errors.map(e => <p>{e}</p>)}
   {this.state.texts.map((t, i) => {
   return (
   <div>
   <p>bound?: {this.q.texts[i].isBound ? 'yes' : 'no'}</p>
   <p>current: {this.q.texts[i].get()}</p>
   <p>pending: {this.q.texts[i].getPending()}</p>
   <DelayedControl
   immediate={this.q.texts[i].isBound}
   onChange={this._change.bind(this, i)}
   onPendingChange={this._pendChange.bind(this, i)}
   >
   <input
   type="text"
   value={this.q.texts[i].getPending() || this.q.texts[i].get()}
   placeholder="Enter text"
   />
   </DelayedControl>
   {this.q.texts[i].errors.map(e => <p>{e}</p>)}
   </div>
   );
   })}
   </div>
   );
   }

   _change = (i, e) => {
   let value = e; //.target.value;
   this.q.texts[i].set(value);
   console.log('setting', this.q.state);
   this.setState(this.q.state);
   }
   
   _pendChange = (i, e) => {
   let value = e; //.target.value;
   this.q.pend().texts[i].set(value).unpend();
   console.log('pending', this.q.texts[i].getPending());
   this.setState(this.q.state);
   }
   } */


export default class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: 2,
      config: _.cloneDeep(this.props)
    };
  }
  
  render() {
    let editing = this.state.editing;
    return (
      <div>
        <h1>{this.state.config.title}</h1>
        {this.state.config.questions.map((q, i) => {
          return (
            <div key={q.id}>
            {this._renderQuestion(q, i, editing)}
            {this._renderEditButton(i)}
            </div>
          );
         })}
      </div>
    );
  }

  _renderQuestion(question, index, editingIndex) {
    return (
      <Question
              key={question.id}
              {...question}
              isEditable={editingIndex === index}
              onSave={this._saveQuestion}
              onCancel={this._cancelEdit}
      />
    );
  }

  _renderEditButton(index) {
    if (this.state.editing === null) {
      return (
        <button
                className="btn btn-default"
                onClick={this._editQuestion.bind(this, index)}
                >
          Edit
        </button>
      );
    }
    return null;
  }
  
  _editQuestion(index) {
    this.setState({editing: index});
  }

  _saveQuestion = (newConfig) => {
    var change = {
      config: {questions: {[this.state.editing]: {$set: newConfig}}},
      editing: {$set: null}
    };
    this.setState(React.addons.update(this.state, change));
  }
  
  _cancelEdit = () => {
    this.setState({editing: null});
  }
}
