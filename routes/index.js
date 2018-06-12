var express = require('express');
var router = express.Router();
const Post = require('../controllers/post.controller.js');


/* This will combine all the other routers available in one file by importing them. Our main server.js file will only include routes/index.js to get access to all the routers */
router.use(require('./post.routes.js'))
router.use(require('./users.routes.js'))

/* GET home page. Home page will redirect user to the top 20 popular posts by upvotes page */
router.get('/', function(req, res, next) {
	/* redirect user to top 20 popular posts by upvotes page */
	res.redirect('/v1/posts/popularity');
});

module.exports = router;
