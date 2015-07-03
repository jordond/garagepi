'use strict';

var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var compose = require('composable-middleware');
var moment = require('moment');
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
        var userToken;
        if (err) return next(err);
        if (!user) return res.sendStatus(401);

        userToken = getToken(req.headers.authorization);
        if (user.tokens.indexOf(userToken) > -1) {
          req.user = user;
          next();
        } else {
          return res.status(401).json({message: 'Access token is invalid or has been revoked.'})
        }
      });
    });
}

/**
 * First validate the token, then validate the user
 * @return {Code} 200 - all good, 406 - nope
 */
function isValidToken() {
  return compose()
  .use(function (req, res, next) {
    validateJwt(req, res, next);
  })
  .use(function (req, res, next) {
    User.findById(req.user._id, function (err, user) {
      if (err) return next(err);
      if (!user) {
        return res.sendStatus(406);
      }
      res.sendStatus(200);
    });
  });
}

/**
 * Grab the token from the user object, if it exists then
 * create a new token, save it to the user object, then return
 * the new token to the client
 * @return {String} Newly generated token
 */
function refreshToken() {
  return compose()
    .use(isAuthenticated())
    .use(function (req, res, next) {
      var newToken, oldToken, index;
      oldToken = getToken(req.headers.authorization);

      if (oldToken !== '') {
        req.user.tokens = removeStaleTokens(req.user.tokens);
        index = req.user.tokens.indexOf(oldToken);
        if (index > -1) {
          req.user.tokens.splice(index, 1);
        }
        newToken = signToken(req.user.id);
        req.user.tokens.push(newToken);
        req.user.save(function (err) {
          if (err) { return res.status(500).json(err); }
          return res.status(200).json({token: newToken});
        });
      } else {
        return res.status(401).json({message: 'Token error'});
      }
    });
}

/**
 * Delete the users token, effectively logging them out.
 * @return {status} code and message
 */
function revokeToken() {
  return compose()
    .use(isAuthenticated())
    .use(isMeOrHasRole('admin'))
    .use(revoke);

  function revoke(req, res, next) {
    var userId = req.body.id;

    User.findById(userId, function (err, user) {
      if (err) return res.status(500).json(err);
      if (!user) return res.sendStatus(404);

      user.tokens = [];
      user.save(function (err) {
        if (err) { return res.status(500).json(err); }
        return res.status(200).json({message: user.username + '\'s token was revoked.'});
      })
    });
  }
}

function logout() {
  return compose()
    .use(function (req, res, next) {
      var token, decoded, userId;
      token = getToken(req.headers.authorization);
      decoded = jwt.decode(token);
      userId = decoded ? decoded._id : '';
      User.findById(userId, function (err, user) {
        var index;
        if (err) return res.status(500).json(err);
        if (!user) return res.sendStatus(200);

        index = user.tokens.indexOf(token);
        user.tokens.splice(index, 1);
        user.save(function (err) {
          if (err) { return res.status(500).json(err); }
            return res.sendStatus(200);
        });
      });
    });
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
function hasRole(roleRequired) {
  if (!roleRequired) {throw new Error('Required role needs to be set');}

  return compose()
    .use(function meetsRequirements(req, res, next) {
      if (!config.secureApi) {return next();}
      if (!req.user) {return res.status(404);}

      if (config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(roleRequired)) {
        next();
      }
      else {
        res.status(403).json({message: 'You don\'t have the authority for that'});
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

function getToken(header) {
  var token = '';
  if (header) {
    if (header.indexOf('Bearer ') !== -1) {
      token = header.split(' ')[1];
    }
  }
  return token;
}

function removeStaleTokens(tokens) {
  var validTokens = [];
  for (var i = 0; i < tokens.length; i++) {
    var decoded = jwt.verify(tokens[i], config.secrets.session);
    if (decoded) {
      validTokens.push(tokens[i]);
    }
  }
  return validTokens;
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(id) {
  return jwt.sign({ _id: id }, config.secrets.session, { expiresInMinutes: config.token.expiry });
}

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie(req, res) {
  if (!req.user) return res.status(404).json({ message: 'Something went wrong, please try again.'});
  var token = signToken(req.user._id, req.user.role);
  res.cookie('token', JSON.stringify(token));
  res.redirect('/');
}

exports.isAuthenticated = isAuthenticated;
exports.isValidToken    = isValidToken;
exports.refreshToken    = refreshToken;
exports.revokeToken     = revokeToken;
exports.hasRole         = hasRole;
exports.isMeOrHasRole   = isMeOrHasRole;
exports.logout          = logout;
exports.checkIsAdmin    = checkIsAdmin;
exports.compareRole     = compareRole;
exports.signToken       = signToken;
exports.setTokenCookie  = setTokenCookie;