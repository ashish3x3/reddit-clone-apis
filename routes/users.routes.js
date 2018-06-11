var express = require('express');
var router = express.Router();
const User = require('../controllers/user.controller.js');


/* GET return all the users */
router.get('/users', function(req, res, next) {
	User.getAll(req, res);
});

/* POST create a new user */
router.post('/users', function(req, res, next) {
	User.create(req, res);
});

module.exports = router;
