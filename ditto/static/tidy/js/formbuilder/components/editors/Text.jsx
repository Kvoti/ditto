import React from 'react';

export default class Text extends React.Component {
  static defaultProps = {
    maxChars: null,
    maxWords: null,
    isMultiLine: false
  }

  render() {
    return (
      <div>
        <div className="form-group">
          <label>
            Max characters
          </label>
          <input
                  className="form-control"
                  type="number"
                  value={this.props.maxChars}
                  onChange={this._update.bind(this, 'maxChars')}
          />
        </div>
        <div className="form-group">
          <label>
            Max words
          </label>
          <input
                  className="form-control"
                  type="number"
                  value={this.props.maxWords}
                  onChange={this._update.bind(this, 'maxWords')}
          />
        </div>
        <div className="form-group">
          <label>
            Is mult-line?
          </label>
          <input
                  className="form-control"
                  type="checkbox"
                  checked={this.props.isMultiLine}
                  onChange={this._update.bind(this, 'isMultiLine')}
          />
        </div>
      </div>
    );
  }

  _update(key, e) {
    this.props.update(key, e);
  }
}
