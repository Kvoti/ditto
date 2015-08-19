import React from 'react';
import Input from './Input';
import { inputValueToInt } from '../../../utils';

export default class Score extends React.Component {
  render() {
    let { score, ...props } = this.props;
    return (
      <Input
              className="form-control"
              errors={score.errors}
              style={{textAlign: 'center'}}
              value={score.get()}
              onChange={(e) => score.set(inputValueToInt(e.target.value))}
              {...props}
      />
    );
  }
}
