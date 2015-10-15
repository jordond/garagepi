'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
if (config.secureApi) {
  router.get('/me', controller.me);
} else {
  router.get('/me', auth.attachId(), controller.me);
}
router.get('/roles', controller.roles);
router.post('/', auth.hasRole('admin'), controller.create);
router.get('/:id', auth.hasRole('admin'), controller.show);
router.put('/:id', auth.isMeOrHasRole('admin'), controller.update);
router.put('/:id/password', auth.isMeOrHasRole('admin'), controller.changePassword);

module.exports = router;
