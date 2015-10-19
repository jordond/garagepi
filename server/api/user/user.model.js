'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var validator = require('validator');
var defaultUserSettings = require('../../settings/user');
var config = require('../../config');

var UserSchema = new Schema({
  name: String,
  username: String,
  email: { type: String, lowercase: true },
  role: {
    type: String,
    default: 'user'
  },
  hashedPassword: String,
  provider: String,
  salt: String,
  lastLogin: {
    type: Date,
    default: null
  },
  tokens: {
    type: []
  },
  settings: {
    type: {},
    default: defaultUserSettings
  }
});

/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

// Public profile information
UserSchema
  .virtual('profile')
  .get(function () {
    return {
      '_id': this._id,
      'name': this.name,
      'email': this.email,
      'username': this.username,
      'role': this.role,
      'lastLogin': this.lastLogin,
      'sessions': this.tokens.length
    };
  });

/**
 * Validations
 */

// Validate empty password
UserSchema
  .path('hashedPassword')
  .validate(function (hashedPassword) {
    return hashedPassword.length;
  }, 'Password cannot be blank');

// Validate empty email
UserSchema
  .path('email')
  .validate(function (email) {
    return email.length;
  }, 'Email cannot be blank');

UserSchema
  .path('email')
  .validate(function (email) {
    return validator.isEmail(email);
  }, 'The email entered is not a valid email.');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function (value, respond) {
    var self = this;
    this.constructor.findOne({email: value}, function (err, user) {
      if (err) { throw err; }
      if (user) {
        if (self.id === user.id) { return respond(true); }
        return respond(false);
      }
      respond(true);
    });
  }, 'Email address is already in use.');

// Validate if the role is in the list of acceptable roles
UserSchema
  .path('role')
  .validate(function (value) {
    return config.userRoles.indexOf(value) > -1;
  }, 'The specified role is not allowed.');

// Check if username is unique
UserSchema
  .path('username')
  .validate(function (value, respond) {
    var self = this;
    this.constructor.findOne({username: value}, function (err, user) {
      if (err) { throw err; }
      if(user) {
        if (self.id === user.id) { return respond(true); }
        return respond(false);
      }
      respond(true);
    });
}, 'Username is already in use.');

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function (next) {
    if (!this.isNew) { return next(); }

    if (!validatePresenceOf(this.hashedPassword)) {
      next(new Error('Invalid password'));
    }
    else {
      next();
    }
  });

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function () {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function (password) {
    if (!password || !this.salt) { return ''; }
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  }
};

module.exports = mongoose.model('User', UserSchema);
