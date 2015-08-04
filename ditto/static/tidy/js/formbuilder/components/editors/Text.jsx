import React, { PropTypes } from 'react';

export default class Text extends React.Component {
  static propTypes = {
    maxChars: PropTypes.number,
    maxWords: PropTypes.number,
    isMultiline: PropTypes.bool,
    onChangeMaxChars: PropTypes.func,
    onChangeMaxWords: PropTypes.func,
    onToggleIsMultiline: PropTypes.func
  }

  static defaultProps = {
    maxChars: null,
    maxWords: null,
    isMultiline: false
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
                  onChange={this.props.onChangeMaxChars}
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
                  onChange={this.props.onChangeMaxWords}
          />
        </div>
        <div className="form-group">
          <label>
            Is mult-line?
          </label>
          <input
                  className="form-control"
                  type="checkbox"
                  checked={this.props.isMultiline}
                  onChange={this.props.onToggleIsMultiline}
          />
        </div>
      </div>
    );
  }
}
