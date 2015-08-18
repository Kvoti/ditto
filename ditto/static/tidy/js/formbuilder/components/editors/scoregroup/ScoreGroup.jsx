import React, { PropTypes } from 'react';
import Row from './Row';
import Col from './Col';
import Label from './Label';
import Score from './Score';
import Sortable from 'react-components/Sortable';

export default class ScoreGroup extends React.Component {

  render() {
    let spec = this.props.question;
    return (
      <div>
        <p>
          <input
                  value={spec.question.get()}
                  onChange={(e) => spec.question.set(e.target.value)}
          />
          <label>
            Is required?
            <input
                    type="checkbox"
                    checked={spec.isRequired.get()}
                    onChange={(e) => spec.isRequired.set(e.target.checked)}
            />
          </label>
        </p>
        <Row>
          <Col></Col>
          <Sortable
                  className='scoregroup-labels'
                  components={
                             spec.scoregroup.labels.members.map(([i, label]) => {
                               return (
                                 <Col key={i} draggable={true} orderingIndex={label.key}>
                                 <Label label={label}/>
                                 </Col>
                               );
                               })}
                onReorder={components => {
                           spec.scoregroup.labels.reorder([for (c of components) c.props.orderingIndex])
                           }}
                  />
           <Col>
           {spec.scoregroup.labels.canAdd() ?
            <button
            onClick={(e) => spec.scoregroup.labels.add()}
            >
            Add label
            </button>
            : null
            }
          </Col>
        </Row>
        <Sortable
                components={
                            spec.scoregroup.items.members.map(([i, item]) => {
                              return (
                                <Row key={i} draggable={true} orderingIndex={item.key}>
                                <Col>
                                <input
                                value={item.text.get()}
                                onChange={(e) => item.text.set(e.target.value)}
                                />
                                </Col>
                                {item.scores.members.map(([i, score]) => {
                                  return (
                                    <Col key={item.text.get() + i} centered={true}>
                                    <Score
                                    score={score} 
                                    name={item.text.get()}
                                    />
                                    </Col>
                                  );
                                })}
                                <Col>
                                {item.canRemove() ?
                                  <button
                                  onClick={item.remove}
                                  >
                                  Remove item
                                  </button>
                                  : null
                                }
                                </Col>
                                </Row>
                              );
                            })
                            }
                onReorder={components => {
                           spec.scoregroup.items.reorder([for (c of components) c.props.orderingIndex])
                           }}
        />
        {spec.scoregroup.items.canAdd() ?
         <p>
         <button
         onClick={(e) => spec.scoregroup.items.add()}
         >
         Add item
         </button>
         </p>
         : null}
      </div>
    );
  }
}
