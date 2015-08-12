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
      schema.string({isRequired: true}),
      {
        unique: true
      }
    ),
    isMultiple: schema.bool(),
    hasOther: schema.bool(),
    otherText: schema.string()
  })
};
