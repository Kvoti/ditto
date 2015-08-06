import React, { PropTypes } from 'react';
import { Button, Glyphicon } from 'react-bootstrap';
import ValidatedControl from '../../../lib/form/ValidatedControl';
import Row from './Row';
import InputGroup from './InputGroup';

export default class Choice extends React.Component {
  static propTypes = {
    // TODO share the prop types for the data with the viewer component
    isMultiple: PropTypes.bool,
    options: PropTypes.arrayOf(PropTypes.string),
    hasOther: React.PropTypes.bool,
    otherText: React.PropTypes.string,
    ////////////////////////////////////////////////////////////////////////////////
    onChangeIsMultiple: PropTypes.func.isRequired,
    onAddOption: PropTypes.func.isRequired,
    onRemoveOption: PropTypes.func.isRequired,
    onChangeOption: PropTypes.func.isRequired,
    onChangeHasOther: PropTypes.func.isRequired,
    onChangeOtherText: PropTypes.func.isRequired,
    onChangeOptionValidation: PropTypes.func.isRequired
  }

  static defaultProps = {
    isMultiple: false,
    options: []
  }

  render() {
    return (
      <div>
        <Row>
          <label>
            Is multiple?
          </label>
          <input
                  type="checkbox"
                  checked={this.props.isMultiple}
                  onChange={this.props.onChangeIsMultiple}
          />
        </Row>
        {this.props.options.map(this._renderOption)}
	<p>
          <Button onClick={this.props.onAddOption}
                  bsStyle='success'
                  ariaLabel='Add option'
                  title='Add option'
                  >
            <Glyphicon glyph="plus" />
          </Button>
        </p>
        <Row>
          <label>
            Has other?
          </label>
          <input
                  type="checkbox"
                  checked={this.props.hasOther}
                  onChange={this.props.onChangeHasOther}
          />
        </Row>
        <Row>
          <label>
            Enter 'other' text:
          </label>
          <input
                  disabled={!this.props.hasOther}
                  type="text"
                  value={this.props.otherText}
                  onChange={this.props.onChangeOtherText}
          />
        </Row>
      </div>
    );
  }

  _renderOption = (option, index) => {
    return (
      <Row
              errors={this.props.errors[index]}
              >
        <label>Option</label>
        <InputGroup>
          <ValidatedControl
                  validate={this._updateOptionValidation.bind(this, index)}
                  immediate={this.props.errors[index] !== null}
                  >
            <input
                    type='text'
                    onChange={this._updateOption.bind(this, index)}
                    value={option}
            />
          </ValidatedControl>
          <span className="input-group-btn">
            <Button onClick={this._removeOption.bind(index)}
                    ref={'option' + index}
                    bsStyle='danger'
                    ariaLabel='Remove option'
                    title='Remove option'
                    >
              <Glyphicon glyph="remove" />
            </Button>
          </span>
        </InputGroup>
      </Row>
    );
  }

  _updateOption(index, e) {
    this.props.onChangeOption(index, e);
  }

  _removeOption = (index) => {
    this.props.onRemoveOption(index);
  }

  _updateOptionValidation(index) {
    this.props.onChangeOptionValidation(index);
  }
}
