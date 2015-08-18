import React from 'react';

import Input from './Input';

export default class Question extends React.Component {
  render() {
    let { question, isRequired } = this.props;
    return (
      <form className="form-inline">
        <div className="form-group">
          <Input
                  className="form-control"
                  size={100}
                  errors={question.errors}
                  value={question.get()}
                  onChange={(e) => question.set(e.target.value)}
          />
        </div>
        {' '}
        <div className="checkbox">
          <label>
            <Input
                    errors={null}
                    type="checkbox"
                    checked={isRequired.get()}
                    onChange={(e) => isRequired.set(e.target.checked)}
            />
            {' '}Is required?
          </label>
        </div>
      </form>
    );
  }
}
