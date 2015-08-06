import React, { PropTypes } from 'react';
import Row from './Row';

export default class Text extends React.Component {
  static propTypes = {
    maxChars: PropTypes.number,
    maxWords: PropTypes.number,
    isMultiline: PropTypes.bool,
    onChangeMaxChars: PropTypes.func,
    onChangeMaxWords: PropTypes.func,
    onChangeIsMultiline: PropTypes.func
  }

  static defaultProps = {
    maxChars: null,
    maxWords: null,
    isMultiline: false
  }

  render() {
    return (
      <div>
        <Row>
          <label>
            Max characters
          </label>
          <input
                  type="number"
                  value={this.props.maxChars}
                  onChange={this.props.onChangeMaxChars}
          />
        </Row>
        <Row>
          <label>
            Max words
          </label>
          <input
                  type="number"
                  value={this.props.maxWords}
                  onChange={this.props.onChangeMaxWords}
          />
        </Row>
        <Row>
          <label>
            Is mult-line?
          </label>
          <input
                  type="checkbox"
                  checked={this.props.isMultiline}
                  onChange={this.props.onChangeIsMultiline}
          />
        </Row>
      </div>
    );
  }
}
