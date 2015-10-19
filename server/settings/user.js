'use strict';

/**
 * Default User Settings
 * To be used to render HTML forms
 *
 * REQUIRED:
 * name: String
 * type: String
 * options: Array (Required if type is `radio/select`)
 *
 * OPTIONALkey: "value",
 * default: String/Boolean/etc
 * placeholder: String
 * required: Boolean
 *
 * Value will be saved to `value: type`
 */

module.exports = {
  schema: {
    type: "object",
    properties: {
      name: { type: "string", minLength: 2, title: "Name", description: "Name or alias" },
      title: {
        type: "string",
        enum: ['dr', 'jr', 'sir', 'mrs', 'mr', 'NaN', 'dj']
      }
    }
  },
  form: [
    "*",
    {
      type: "submit",
      title: "Save"
    }
  ],
  model: {
    createdAt: new Date()
  }
};
