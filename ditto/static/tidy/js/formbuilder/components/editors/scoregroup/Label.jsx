import React from 'react';

import Score from './Score';
import Input from './Input';

export default class Label extends React.Component {
  render() {
    let label = this.props.label;
    return (
      <div style={{textAlign: 'center'}}>
        {label.canRemove() ?
         <button
         onClick={label.remove}
         >
         Remove
         </button>
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
