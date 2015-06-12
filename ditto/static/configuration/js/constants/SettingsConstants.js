var keyMirror = require('keymirror');

module.exports = {
    ActionTypes: keyMirror({
        CLICK_ROLE: null,
        CLICK_ITEM: null,

        // TODO perhaps these text operations could be a single action with the item
        // being updated specified on the action object. Seems quite verbose listing out
        // all the text items that can be edited and having an action for each
        UPDATE_CASE_NOTES_TITLE: null,
        UPDATE_POST_SESSION_FEEDBACK_TITLE: null,
        UPDATE_POST_SESSION_FEEDBACK_QUESTION: null,

        DISABLE_IMPACT_FOOTPRINT_ITEM: null,
        ENABLE_IMPACT_FOOTPRINT_ITEM: null,
        DISABLE_IMPACT_FOOTPRINT_ITEM_CONTENT: null,
        ENABLE_IMPACT_FOOTPRINT_ITEM_CONTENT: null,

        ENABLE_REG_FIELD: null,
        DISABLE_REG_FIELD: null,

        ADD_TEXT_FIELD: null,
        ADD_CHOICE_FIELD: null,

        UPDATE_CHOICE_FIELD: null,

        RECEIVE_REG_FORM_SETTINGS: null,

        RECEIVE_CHATROOMS: null,
        RECEIVE_SLOTS: null,
        CREATE_SLOT: null,
        UPDATE_SLOT: null,
        DELETE_SLOT: null,
    }),

    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],

};
