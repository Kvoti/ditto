import _ from 'lodash';
import * as schema from '../../../lib/schema/schema';

export const textQuestion = {
  question: schema.string({isRequired: true}),
  isRequired: schema.bool(),
  text: schema.shape({
    isMultiline: schema.bool(),
    maxChars: schema.integer({max: 100}),
    maxWords: schema.integer({
      validate: function validateMaxWords() {
        let errors = [];
        if (!this.question.text.isMultiline.get() && this.get()) {
          errors.push("Can't specify max words if question is not multiline");
        }
        return errors;
      }
    })
  })
};

export const choiceQuestion = {
  question: schema.string({isRequired: true}),
  isRequired: schema.bool(),
  choice: schema.shape({
    options: schema.array(
      schema.string({
        isRequired: true
        // TODO not sure if empty belongs here or level above (or can be either)
        // empty: ''
      }),
      {
        unique: true,
        canAdd: true,
        maxLength: 5,
        canRemove: true,
        minLength: 2,
        empty: '',
        canReorder: true
      }
    ),
    isMultiple: schema.bool(),
    hasOther: schema.bool(),
    otherText: schema.string()
  })
};

export const scoreGroupQuestion = {
  question: schema.string({isRequired: true}),
  isRequired: schema.bool(),
  scoregroup: schema.shape({
    labels: schema.array(
      schema.shape({
        label: schema.string({isRequired: true}),
        defaultScore: schema.integer({isRequired: true})
      }),
      {
        unique: true,
        canAdd: true,
        maxItems: 5,
        minItems: 2,
        canRemove: true,
        canReorder: true,
        empty: {
          label: '',
          defaultScore: null
        },
        postAdd: function() {
          // TODO schema API should support this better
          for (let j in this.scoregroup.items) {
            if (this.scoregroup.items[j].scores) {
              this.scoregroup.items[j].scores.add(null);
            }
          }
        },
        validate: function() {
          let labels = [for (i of this.get()) i.label];
          console.log('labels', labels);
          if (!_.isEqual(labels, _.unique(labels))) {
            this.addError('Must be unique');
          }
          return [];
        }
      }
    ),
    items: schema.array(
      schema.shape({
        text: schema.string({isRequired: true}),
        scores: schema.array(
          schema.integer(),
          {
            unique: true,
            canReorder: true
          }
        )
      }),
      {
        canAdd: true,
        maxItems: 10,
        minItems: 1,
        canRemove: true,
        canReorder: true,
        empty: {text: '', scores: []},  // TODO init scores properly
        validate: function() {
          let texts = [for (i of this.get()) i.text];
          if (!_.isEqual(texts, _.unique(texts))) {
            this.addError('Must be unique');
          }
          return [];
        }
      }
      //{unique: ['text']} ??
    )
  })
};
