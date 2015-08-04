import React, { PropTypes } from 'react';
import { Button, Glyphicon } from 'react-bootstrap';

export default class AddButton extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired
  }

  render() {
    let label = 'Add ' + this.props.name;
    return (
	<p>
          <Button bsStyle='success'
                  ariaLabel={label}
                  title={label}
                  {...this.props}
                  >
            <Glyphicon glyph="plus" />
          </Button>
        </p>
    );
  }
}
