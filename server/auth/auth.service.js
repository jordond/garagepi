'use strict';

var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/environment');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var compose = require('composable-middleware');
var User = require('../api/user/user.model');
var validateJwt = expressJwt({ secret: config.secrets.session });

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isAuthenticated() {
  return compose()
    // Validate jwt
    .use(function (req, res, next) {
      // allow access_token to be passed through query parameter as well
      if(req.query && req.query.hasOwnProperty('access_token')) {
        req.headers.authorization = 'Bearer ' + req.query.access_token;
      }
      validateJwt(req, res, next);
    })
    // Handle the validation errors
    .use(function (err, req, res, next) {
      if (err) {
        return res.status(err.status).json(err);
      } else {
        next();
      }
    })
    // Attach user to request
    .use(function (req, res, next) {
      User.findById(req.user._id, function (err, user) {
        if (err) return next(err);
        if (!user) return res.status(401);

        req.user = user;
        next();
      });
    });
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
function hasRole(roleRequired) {
  if (!roleRequired) throw new Error('Required role needs to be set');

  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      if (config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(roleRequired)) {
        next();
      }
      else {
        res.sendStatus(403);
      }
    });
}

/**
 * Checks if it is the current user, or is an admin
 */
function isMeOrHasRole(roleRequired) {
  return compose()
    .use(function checkIsMe(req, res, next) {
      var userId = req.params.id;
      if (req.user.id) {
        if (req.user.id === userId) {
          next();
        } else {
          if (compareRole(roleRequired, req.user.role)) {
            next();
          } else {
            res.status(403).json({message: 'You don\'t have the authority for that'});
          }
        }
      } else {
        res.sendStatus(401);
      }
    });
}

/**
 * Helper function
 * Check if the user is admin
 */
function checkIsAdmin(roleToCheck) {
  if (config.userRoles.indexOf(roleToCheck) >= config.userRoles.indexOf('admin')) {
    return true;
  } else {
    return false;
  }
}

function compareRole(roleRequired, roleToCheck) {
  if (config.userRoles.indexOf(roleToCheck) >= config.userRoles.indexOf(roleRequired)) {
    return true;
  } else {
    return false;
  }
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(id) {
  return jwt.sign({ _id: id }, config.secrets.session, { expiresInMinutes: 60*5 });
}

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie(req, res) {
  if (!req.user) return res.json(404, { message: 'Something went wrong, please try again.'});
  var token = signToken(req.user._id, req.user.role);
  res.cookie('token', JSON.stringify(token));
  res.redirect('/');
}

exports.isAuthenticated = isAuthenticated;
exports.hasRole = hasRole;
exports.isMeOrHasRole = isMeOrHasRole;

exports.checkIsAdmin = checkIsAdmin;
exports.compareRole = compareRole;
exports.signToken = signToken;
exports.setTokenCookie = setTokenCookie;