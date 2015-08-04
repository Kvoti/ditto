import React, { PropTypes } from 'react';
import { Button, Glyphicon } from 'react-bootstrap';
import Validate from '../../../lib/form/Validate';

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
      <div className="form-group">
        <div className="input-group">
          <Validate
                  isRequired={true}
                  onChange={this.props.onValidationChange(this.props.id)}
                  >
            <input
                    className="form-control"
                    type='text'
                    onChange={(e) => this.props.onChange(this.props.id, e)}
                    value={this.props.value}
            />
        </Validate>
        <span className="input-group-btn">
        <Button onClick={() => this.props.onRemove(this.props.id)}
                bsStyle='danger'
                ariaLabel={'Remove ' + name}
                title={'Remove ' + name}
                >
          <Glyphicon glyph="remove" />
        </Button>
        </span>
      </div>
      </div>
    );

  }
}
