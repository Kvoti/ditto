import React, { PropTypes } from 'react';

import getID from '../../../../lib/id';
import Sortable from 'react-components/Sortable';
import * as schemaTypes from '../../../../lib/schema/proxies';
import ControlRow from './ControlRow';
import AddButton from './AddButton';
import { inputValueToInt } from '../../../utils';

export default class Renderer extends React.Component {
  constructor(props) {
    super(props);
    this.controlID = getID();
  }
  
  static propTypes = {
    question: PropTypes.object
  }

  render() {
    let parts = [];
    let question = this.props.question;
    for (let key in question) {
      if (question.hasOwnProperty(key) && question[key] && question[key].pend) {
        parts.push(this._renderPart(key, question[key]));
      }
    }
    return (
      <div className="form-horizontal">
        {parts}
      </div>
    );
  }

  _renderPart(name, part) {
    console.log('rendering part', part.path, typeof part, part.canReorder());
    let rendered;
    if (this._isLeaf(part)) {
      rendered = this._renderItem(part, name);
    } else {
      rendered = this._renderCollection(part);
    }
    return (
      <div
              style={part.canReorder() ? {color: 'red'} : null}
              key={part.path}
              draggable={part.canReorder()}
              orderingIndex={part.key}
              >
        {rendered}
        <div className="col-md-offset-4">
          {this._renderAddButton(part)}
        </div>
      </div>
    );
  }
  
  _isLeaf(part) {
    return (
      !(part instanceof schemaTypes.ShapeManager) &&
      !(part instanceof schemaTypes.ArrayManager)
    );
  }

  _renderCollection(part) {
    let parts = [];
    part._memberKeys.forEach(k => {    
      parts.push(this._renderPart(k, part[k]));
    });
    // this only applies to array so split out the colleciton function
    if (part.canReorderItems && part.canReorderItems()) {
      parts = (
        <Sortable
                components={parts}
                onReorder={components => part.reorder([for (c of components) c.props.orderingIndex])}
        />
      );
    }
    return (
      <div>
        {parts}
        {this._renderDeleteButton(part)}
      </div>
    );
  }

  _renderAddButton(part) {
    if (part.canAdd && part.canAdd()) {
      return <AddButton onClick={() => part.add()} />;
    }
    return null;
  }

  _renderDeleteButton(part) {
    if (part.canRemove()) {
      return (
        <div className="col-md-offset-4">
          <button
                  className="btn btn-danger"
                  onClick={() => part.remove()}
                  >
            Remove {part.parent.key}
          </button>
        </div>
      );
    }
    return null;
  }
  
  _renderItem(part, name) {
    console.log('rendering item', part.path);
    let ID = this._getItemID(part);
    let errors = part.errors;
    let type;
    let onChange;
    let onPendingChange;
    // TODO add type property to XManager instead?
    if (part instanceof schemaTypes.StringManager) {
      type = 'string';
      onChange = (v) => part.set(v);
      onPendingChange = (v) => part.pend().set(v);
    } else if (part instanceof schemaTypes.BoolManager) {
      type = 'bool';
      onChange = (v) => part.set(v);
    } else if (part instanceof schemaTypes.IntegerManager) {
      onChange = (v) => part.set(inputValueToInt(v));
      onPendingChange = (v) => part.pend().set(inputValueToInt(v));
    }
    return (
      <ControlRow
              key={part.path}
              id={ID}
              name={name}
              type={type}
              value={part.getPendingOrCurrent()}
              errors={errors}
              validateImmediately={part.question.isBound}
              onChange={onChange}
              onPendingChange={onPendingChange}
              onRemove={part.canRemove() && (() => part.remove())}
              orderingIndex={part.canReorder() && part.key}
      />
    );
  }
  
  _getItemID(item) {
    return `${this.controlID}${item.path}`;
  }

  // TODO this logic probably belongs in the Managers
  _getItemErrors(item) {
    if (item instanceof schemaTypes.StringManager &&
      (!item.isBound ||
       !item.errors.length && !item.options.isRequired && item.get() === '')
    ) {
      return null;
    }
    if (item instanceof schemaTypes.BoolManager &&
      (!item.isBound ||
       !item.errors.length && !item.options.isRequired)
    ) {
      return null;
    }
    if (item instanceof schemaTypes.IntegerManager &&
      (!item.errors.length && !item.options.isRequired && item.get() === null)) {
        return null;
    }
    return item.errors;
  }

}
