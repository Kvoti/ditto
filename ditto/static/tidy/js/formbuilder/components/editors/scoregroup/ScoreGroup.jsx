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
    let textColSize = Math.max(
      ...spec.scoregroup.items.members.map(
        m => Math.sqrt(String(m[1].text.get()).length) * 45 + 30
      )
    );
    let labelColSizes = spec.scoregroup.labels.members.map(l =>
      Math.sqrt(String(l[1].label.get()).length) * 40 + 60
    );
    return (
      <div>
        <Question question={spec.question} isRequired={spec.isRequired} />
        <Row>
          <Col style={{width: textColSize}}></Col>
          <Sortable
                  className='scoregroup-labels'
                  components={
                             spec.scoregroup.labels.members.map(([i, label]) => {
                               return (
                                 <Col
                                 style={{width: labelColSizes[i]}}
                                 key={i}
                                 draggable={true}
                                 orderingIndex={label._key}
                                 >
                                 <Label label={label} />
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
                                <Col style={{width: textColSize}}>
                                <Input
                                errors={item.text.errors}
                                value={item.text.get()}
                                onChange={(e) => item.text.set(e.target.value)}
                                />
                                </Col>
                                {item.scores.members.map(([j, score]) => {
                                  return (
                                    <Col
                                    style={{width: labelColSizes[j]}}
                                    key={item.text.get() + j}
                                    centered={true}
                                    >
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
