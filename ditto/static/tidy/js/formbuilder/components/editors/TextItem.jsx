import React, { PropTypes } from 'react';
import { Button, Glyphicon } from 'react-bootstrap';
import Row from './Row';
import InputGroup from './InputGroup';

export default class TextItem extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    onValidationChange: PropTypes.func.isRequired
  }

  render() {
    return (
      <Row errors={this.props.errors}>
        <label>{name}</label>
        <InputGroup>
          <input
                  type='text'
                  onChange={(e) => this.props.onChange(this.props.id, e)}
                  value={this.props.value}
          />
          <span className="input-group-btn">
            <Button onClick={() => this.props.onRemove(this.props.id)}
                    bsStyle='danger'
                    ariaLabel={'Remove ' + name}
                    title={'Remove ' + name}
                    >
              <Glyphicon glyph="remove" />
            </Button>
          </span>
        </InputGroup>
      </Row>
    );
  }
}
