var express = require('express');
var router = express.Router();

/* GET return all the users */
router.get('/users', function(req, res, next) {
  res.json(users);
});

/* POST create a new user */
router.post('/users', function(req, res, next) {
	var newUser = new User(users.length, req.body.name);
	users.push(newUser);
	res.json(newUser);
});

module.exports = router;
