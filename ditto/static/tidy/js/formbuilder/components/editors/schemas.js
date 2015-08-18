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
        isRequired: true,
        // TODO not sure if empty belongs here or level above (or can be either)
        // empty: ''
        unique: true
      }),
      {
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
        label: schema.string({isRequired: true, unique: true}),
        defaultScore: schema.integer({isRequired: true, unique: true})
      }),
      {
        canAdd: true,
        maxLength: 5,
        minLength: 2,
        canRemove: true,
        canReorder: true,
        empty: {
          label: '',
          defaultScore: null
        },
        postAdd: function() {
          // Append a null score for each item
          this.scoregroup.items.members.forEach(([i, item]) => {
            item.scores.add(null);
          });
        },
        postRemove: function(index) {
          // Remove corresponding score from each item
          this.scoregroup.items.members.forEach(([i, item]) => {
            item.scores[index].remove();
          });
        },
        postReorder: function(indices) {
          // Reorder corresponding scores for each item
          this.scoregroup.items.members.forEach(([i, item]) => {
            item.scores.reorder(indices);
          });
        }
      }
    ),
    items: schema.array(
      schema.shape({
        text: schema.string({
          isRequired: true,
          unique: true
        }),
        scores: schema.array(
          schema.integer({unique: true}),
          {
            canReorder: true
          }
        )
      }),
      {
        canAdd: true,
        maxLength: 10,
        minLength: 1,
        canRemove: true,
        canReorder: true,
        empty: {text: '', scores: []},  // TODO init scores properly
        postAdd: function(item) {
          // Add a null score to this item for each label
          let scores = [for (l of this.scoregroup.labels.members) null];
          item.scores.set(scores);
        }
      }
    )
  })
};
