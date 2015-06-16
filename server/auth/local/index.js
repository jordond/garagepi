'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');

var router = express.Router();

router.post('/', function(req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    var error = err || info, token;

    if (error) return res.status(400).json(error);
    if (!user) return res.status(404).json({message: 'Something went wrong, please try again.'});

    token = auth.signToken(user._id, user.role)
    user.tokens.push(token);

    user.lastLogin = new Date();

    user.save(function (err) {
      res.json({user: user.profile, token: token});
    });
  })(req, res, next)
});

module.exports = router;