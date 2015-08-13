import React, { PropTypes } from 'react';

import * as schemaTypes from '../../../lib/schema/proxies';
import DelayedControl from '../../../lib/form/DelayedControl';
import Row from './Row';

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

  _renderPart(name, part) {
    if (name === 'chain') {
      return null;
    }
    //console.log('rendering', name, part && part.path, part && part.errors);
    if (part instanceof schemaTypes.ShapeManager || part instanceof schemaTypes.ArrayManager) {
      let parts = [];
      for (let k in part) {
        if (k !== 'chain' && part.hasOwnProperty(k) && part[k] instanceof schemaTypes.MemberManager) {
          console.log('kkk', k);
          parts.push(this._renderPart(k, part[k].item));
        }
      }
      return (
        <div>
          {part.errors.map(e => <p>{e}</p>)}
          {parts.map((item, i) => {
            return (
              <div>
                {item}
                {part.canRemove && part.canRemove() ?
                <button className="btn btn-danger btn-sm"
                  onClick={() => part.remove(i)}
                  >
                  Remove
                </button>
                : null}
              </div>
            );
          })}
          {part.canAdd && part.canAdd() ?
           <button
           className="btn btn-success"
           onClick={(e) => part.add()}
           >
           Add
           </button>
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
      console.log('string', part.get(), 'bound', part.isBound, part.errors);
      return (
        <Row key={name} errors={errors}>
          <label>{this._toLabel(name)}</label>
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
