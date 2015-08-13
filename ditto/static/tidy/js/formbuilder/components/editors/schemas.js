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
      schema.string({isRequired: true})
    ),
    items: schema.array(
      schema.shape({
        text: schema.string({isRequired: true}),
        scores: schema.array(
          schema.integer({isRequired: true}),
          {unique: true}
        )
      }),
      {
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
