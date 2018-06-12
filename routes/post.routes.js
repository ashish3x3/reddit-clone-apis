
var express = require('express');
var router = express.Router();
const Post = require('../controllers/post.controller.js');

/* All the routes related to Topic(posts) of the site will be available from this file to our App. */

/* POST create a new post. Route that receives a POST request to /posts  */
router.post('/posts', function(req, res, next) {
	Post.create(req, res);
});

/* GET all posts */
router.get('/posts', function (req, res) {
	Post.getAll(req, res);

});

/* validate authentication of the user who is upvoting. This has been included here so that no non-authenticated user could upvote the content which he is only allowed to read. This will also save the API from spamming bogus request to upvote/downvote a topic */
function validateAuthentication(req, res, next) {
	next(); //continue processing the request
}

/* PUT update a post votes by upvoting it. Before upvoting check if the user is valid authenticated user or not. */
router.put('/posts/:id/up', validateAuthentication, function (req, res) {
	Post.upvote(req, res);
});

/* PUT update a post votes by down-voting it. Before upvoting check if the user is valid authenticated user or not. */
router.put('/posts/:id/down', validateAuthentication, function (req, res) {
	Post.downvote(req, res);
});

/* GET return the top 20 popular posts by upvotes. Here 20 is hardcoded value if no limit is provided on how many post to return */
router.get('/posts/popularity', validateAuthentication, function (req, res) {
	Post.popularPosts(req, res);
});

/* GET return the top N posts where N = :limit passed as filter param to the API */
router.get('/posts/popularity/:limit?', validateAuthentication, function (req, res) {
	Post.popularPosts(req, res);
});

module.exports = router;
