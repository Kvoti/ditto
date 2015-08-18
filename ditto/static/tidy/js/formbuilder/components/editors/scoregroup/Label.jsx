import React from 'react';

import Score from './Score';
import Input from './Input';
import RemoveButton from './RemoveButton';

export default class Label extends React.Component {
  render() {
    let label = this.props.label;
    return (
      <div style={{textAlign: 'center'}}>
        {label.canRemove() ?
         <RemoveButton
         onClick={label.remove}
         >
         Remove
         </RemoveButton>
         : null
         }
         <br/>
         <Input
                 errors={label.label.errors}
                 style={{textAlign: 'center'}}
                 value={label.label.get()}
                 onChange={(e) => label.label.set(e.target.value)}
         />
         <br/>
         <Score score={label.defaultScore} />
      </div>
    );
  }
}
