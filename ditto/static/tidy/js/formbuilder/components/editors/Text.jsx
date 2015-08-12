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
    console.log('text props', this.props);
    //disabled={!this.props.isMultiline}
    return (
      <div>
        <Row errors={this.props.maxChars ? this.props.errors.maxChars : null}>
          <label>
            Max characters
          </label>
          <input
                  type="text"
                  value={this.props.maxChars}
                  onChange={(e) => this.props.onChangeMaxChars(e.target.value)}
          />
        </Row>
        <Row errors={this.props.maxWords ? this.props.errors.maxWords : null}>
          <label>
            Max words
          </label>
          <input
                  type="number"
                  value={this.props.maxWords}
                  onChange={(e) => this.props.onChangeMaxWords(e.target.value)}
          />
        </Row>
        <Row>
          <label>
            Is mult-line?
          </label>
          <input
                  type="checkbox"
                  checked={this.props.isMultiline}
                  onChange={(e) => this.props.onChangeIsMultiline(e.target.checked)}
          />
        </Row>
      </div>
    );
  }
}
