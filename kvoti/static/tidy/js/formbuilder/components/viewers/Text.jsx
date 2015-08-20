import React, { PropTypes } from 'react';

export default class Text extends React.Component {

  static propTypes = {
    question: PropTypes.string.isRequired,
    isRequired: PropTypes.bool,
    text: PropTypes.shape({
      maxChars: PropTypes.number,
      maxWords: PropTypes.number,
      isMultiline: PropTypes.bool
    })
  }

  render() {
    return (
      <div className="form-group">
        <label>
          {this.props.question}?{this.props.isRequired ? ' *' : ' '}
        </label>
        
          {this.props.text.isMultiline ?
           <textarea className="form-control" />
           :
           <input className="form-control" type="text" />
           }
      </div>
    );
  }
}
