'use strict';

var express = require('express');
var controller = require('./gpio.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.toggle);

module.exports = router;