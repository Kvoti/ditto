import React from 'react';
import BaseEditor from './BaseEditor';

export default class Text extends BaseEditor {
  static defaultProps = {
    question: '',
    isRequired: false
  }

  render() {
    return (
      <div style={{border: '1px solid black'}}>
        <div className="form-group">
          <label>
            Enter question text:
          </label>
          <input
                  className="form-control"
                  autoFocus={true}
                  type="text"
                  value={this.state.config.question}
                  onChange={this._update.bind(this, 'question')}
          />
        </div>
        <div className="form-group">
          <label>
            Is required?
          </label>
          <input
                  className="form-control"
                  type="checkbox"
                  value={this.state.config.isRequired}
                  onChange={this._update.bind(this, 'isRequired')}
          />
        </div>
        {!this.state.isCancelling ?
         <button
         className="btn btn-warning"
         onClick={this._confirmCancel}
         >
         Cancel
         </button>
         :
         <div>
         <p>You have unsaved changes, are you sure you want to cancel?</p>
         <button
         className="btn btn-danger"
         onClick={this._cancel}
         >
         Yes
         </button>
         <button
         className="btn btn-success"
         onClick={this._cancelCancel}
         >
         No
         </button>
         </div>
         }
      </div>
    );
  }

  
}
