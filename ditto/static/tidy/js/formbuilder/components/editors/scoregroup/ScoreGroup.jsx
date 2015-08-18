import React, { PropTypes } from 'react';
import Sortable from 'react-components/Sortable';

import Question from './Question';
import Row from './Row';
import Col from './Col';
import Label from './Label';
import Score from './Score';
import Input from './Input';
import AddButton from './AddButton';
import RemoveButton from './RemoveButton';

export default class ScoreGroup extends React.Component {

  render() {
    let spec = this.props.question;
    return (
      <div>
        <Question question={spec.question} isRequired={spec.isRequired} />
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
            <AddButton
            onClick={(e) => spec.scoregroup.labels.add()}
            >
            Add label
            </AddButton>
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
                                <Input
                                errors={item.text.errors}
                                value={item.text.get()}
                                onChange={(e) => item.text.set(e.target.value)}
                                />
                                </Col>
                                {item.scores.members.map(([j, score]) => {
                                  return (
                                    <Col key={item.text.get() + j} centered={true}>
                                    <Score
                                    score={score} 
                                    name={item.text.get()}
                                    />
                                    </Col>
                                  );
                                })}
                                <Col>
                                {item.canRemove() ?
                                  <RemoveButton
                                  onClick={item.remove}
                                  ariaLabel="Remove item"
                                  title="Remove item"
                                  />
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
         <AddButton
         onClick={(e) => spec.scoregroup.items.add()}
         >
         Add item
         </AddButton>
         </p>
         : null}
      </div>
    );
  }
}
