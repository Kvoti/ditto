import React from 'react';
import * as schema from '../../../lib/schema/schema';
import ControlErrors from '../editors/renderer/ControlErrors';

export default class Choice extends React.Component {
  static propTypes = {
    question: React.PropTypes.string.isRequired,
    isRequired: React.PropTypes.bool,
    choice: React.PropTypes.shape({
      options: React.PropTypes.arrayOf(
        React.PropTypes.string).isRequired,
      isMultiple: React.PropTypes.bool,
      hasOther: React.PropTypes.bool,
      otherText: React.PropTypes.string
    })
  }

  constructor(props) {
    super(props);
    this.init(props);
  }

  init(props) {
    let factory = this.props.choice.isMultiple ? schema.multichoice : schema.choice;
    let value = new schema.ManagedObject(
      factory(
        this.props.choice.options,
        {
          isRequired: props.isRequired
        }
      ),
      {
        onChange: () => this.forceUpdate()
      }
    );
    this.state = {
      value
    };
  }

  componentWillReceiveProps(newProps) {
    this.init(newProps);
  }

  render() {
    const type = this.props.choice.isMultiple ? 'checkbox' : 'radio';
    return (
      <div>
        <div className="form-group">
          <label>
            {this.props.question || <p><em>Please enter question</em></p>}
            {this.props.choice.isMultiple ?
             <small> (You can select more than one)</small>
             : null
             }
             {this.props.isRequired ? ' *' : ''}
          </label>
        </div>
        {this.props.choice.options ?
         this.props.choice.options.map(option => {
            return (
              <div className={type}>
              <label key={option}>
              <input
              type={type}
              name={this.props.question}
              checked={this._isChecked(option)}
                      onChange={this._onChange.bind(this, option)}
              />
              {' '}{option}
              </label>
              </div>
            );
         }) : <p><em>Please add at least two options</em></p>}
        <ControlErrors errors={this.state.value.managed.errors}/>
        {this.props.choice.hasOther ?
         (
           <div className="form-group">
           <label>
           {this.props.choice.otherText || 'Other'}:{' '}
           </label>
           <input className="form-control" type="text" />
           </div>
         ) : null}
      </div>
    );
  }

  _isChecked(option) {
    console.log(option, this.state.value.managed.get());
    if (!this.props.choice.isMultiple) {
      return this.state.value.managed.get() === option;
    }
    return this.state.value.managed.get().indexOf(option) !== -1;
  }
    
  _onChange(option, e) {
    if (!this.props.choice.isMultiple) {
      console.log('setting', option);
      this.state.value.managed.set(option);
    } else {
      if (e.target.checked) {
        this.state.value.managed.add(option);
      } else {
        console.log('removing', option);
        this.state.value.managed.removeX(option);
      }
    }
  }
}
