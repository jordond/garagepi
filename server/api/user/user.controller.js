'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config');
var jwt = require('jsonwebtoken');
var auth = require('../../auth/auth.service');

var validationError = function (res, err) {
  return res.status(422).json(err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function (req, res, next) {
  var userList = [];
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return next(err);
    for (var i = 0; i < users.length; i++) {
      userList.push(users[i].profile);
    }
    res.status(200).json({data: userList});
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    res.status(200).json({
      message: user.username + ' was successfully created!',
      data: user.profile
    });
  });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.sendStatus(404);
    res.status(200).json({data: user.profile});
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function (req, res, next) {
  User.findById(req.params.id, function (err, user) {
    if (err) { return next(err); }
    if (!user) { return res.sendStatus(404); }
    user.remove(function (err) {
      if (err) { return res.status(500).json(err); }
      return res.status(204).json({message: user.username + ' was successfully deleted!'});
    });
  });
};

/**
 * Change a users password
 */
exports.changePassword = function (req, res, next) {
  var userId = req.params.id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass) || auth.checkIsAdmin(req.user.role)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.status(200).json({message: 'Password successfully updated!'});
      });
    } else {
      res.status(403).json({message: 'Old password was incorrect'});
    }
  });
};

/**
 * Get my info
 */
exports.me = function (req, res, next) {
  var userId, token, newToken;
  if (typeof req.user !== 'undefined') {
    userId = req.user._id;
    token = req.user.token;
  }

  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) {
    if (err) return next(err);
    if (!user) return res.status(401).json({message: 'Either you were logged out, or server restarted'});

    newToken = auth.replaceToken(user, token);
    res.status(200).json({data: user, newToken: newToken});
  });
};

/**
 * Return all the user roles
 */
exports.roles = function (req, res, next) {
  var userRoles = config.userRoles;
  if (userRoles.length > 0) {
    return res.status(200).json({data: userRoles});
  } else {
    return res.status(404).json({message: 'No user roles were found...'});
  }
};

/**
 * Update user with given id
 * restriction: self || 'admin'
 */
exports.update = function (req, res, next) {
  var userId = req.params.id;
  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.status(404).json({message: 'Specified user not found'});
    user.username = req.body.username;
    user.name = req.body.name;
    if (auth.checkIsAdmin(user.role)) {
      user.role = req.body.role;
    }
    user.email = req.body.email;
    user.save(function(err) {
      if (err) return validationError(res, err);
      res.status(200).json({message: 'User was successfully updated!', data: user.profile});
    });
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function (req, res, next) {
  res.redirect('/');
};
