import React, { PropTypes } from 'react';

import * as schemaTypes from '../../../lib/schema/proxies';
import DelayedControl from '../../../lib/form/DelayedControl';
import Row from './Row';
import InputGroup from './InputGroup';
import { Button, Glyphicon } from 'react-bootstrap';
import Sortable from 'react-components/Sortable';

export default class Renderer extends React.Component {

  static propTypes = {
    question: PropTypes.object
    // Like fixedDataTable have *lots* of hooks to customise?
    //rowRenderer: PropTypes.func,
    //fieldRenderer: PropTypes.func,
  }

  render() {
    let parts = [];
    let question = this.props.question;
    for (let key in question) {
      if (question.hasOwnProperty(key)) {
        parts.push(this._renderPart(key, question[key]));
      }
    }
    return (
      <div className="well">
        {parts}
      </div>
    );
  }

  _renderPart(name, part, options) {
//    console.log('rendering', name);
    if (name === 'chain' || 'name' === 'item' && name === 'question') {
      return null;
    }
    //console.log('rendering', name, part && part.path, part && part.errors);
    if (part instanceof schemaTypes.ShapeManager || part instanceof schemaTypes.ArrayManager) {
      let parts = [];
      for (let k in part) {
        if (k !== 'chain' && part.hasOwnProperty(k) && part[k] instanceof schemaTypes.MemberManager) {
//          console.log('kkk', k);
          let removeItem;
          if (part.canRemove && part.canRemove()) {
            removeItem = () => part.remove(k);
          }
          parts.push(this._renderPart(k, part[k].item, {removeItem, itemIndex: k}));
        }
      }
      return (
        <div>
          {part.errors.map(e => <p>{e}</p>)}
          {part.options && part.options.canReorder ?
          <Sortable
                  components={parts}
                  onReorder={components => part.reorder([for (c of components) c.props.index])}
          /> :
          parts }
              {part.canAdd && part.canAdd() ?
               <div className="form-group">
               <div className="col-md-offset-4">
               <button
               className="btn btn-success"
               onClick={(e) => part.add()}
               >
               Add
               </button>
               </div>
               </div>
               : null
               }
        </div>
      );
    }
    if (part instanceof schemaTypes.StringManager) {
      let errors;
      if (!part.isBound || !part.errors.length && !part.options.isRequired && part.get() === '') {
        errors = null;
      } else {
        errors = part.errors;
      }
//      console.log('string', part.get(), 'bound', part.isBound, part.errors);
      return (
        <Row key={name} errors={errors} index={options && options.itemIndex}>
          <label>{this._toLabel(name)}</label>
          <InputGroup hasAddon={options && options.removeItem}>
            <DelayedControl
                    immediate={part.question.isBound}
                    onChange={(v) => part.set(v)}
                    onPendingChange={(v) => part.pend().set(v)}
                    >
              <input
                      type="text"
                      value={part.getPendingOrCurrent()}
              />
            </DelayedControl>
            {options && options.removeItem ?
            <span className="input-group-btn">
              <Button onClick={options.removeItem}
                      bsStyle='danger'
                      ariaLabel={'Remove ' + name}
                      title={'Remove ' + name}
                      >
                <Glyphicon glyph="remove" />
              </Button>
            </span>
             : null }
            </InputGroup>
        </Row>
      );
    }
    if (part instanceof schemaTypes.BoolManager) {
      return (
        <Row key={name}>
          <label>{this._toLabel(name)}</label>
          <input
                  type="checkbox"
                  onChange={(e) => part.set(e.target.checked)}
                  checked={part.getPendingOrCurrent()}
          />
        </Row>
      );
    }
    if (part instanceof schemaTypes.IntegerManager) {
      let errors;
      if (!part.errors.length && !part.options.isRequired && part.get() === null) {
        errors = null;
      } else {
        errors = part.errors;
      }
      return (
        <Row key={name} errors={errors}>
          <label>{this._toLabel(name)}</label>
          <DelayedControl
                  immediate={part.question.isBound}
                  onChange={(v) => part.set(this._toInt(v))}
                  onPendingChange={(v) => part.pend().set(this._toInt(v))}
                  >
            <input
                    type="text"
                    value={part.getPendingOrCurrent()}
            />
          </DelayedControl>
        </Row>
      );
    }
    return null;
  }

  _toInt(value) {
    if (value === '') {
      return null;
    }
    let parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      return value;
    }
    return parsed;
  }
  
  _toLabel(name) {
    name = name.replace(/([A-Z])/, (m, p1) => ' ' + p1.toLowerCase());
    name = name.replace(/^([a-z])/, (m, p1) => ' ' + p1.toUpperCase());
    return name;
  }
}
