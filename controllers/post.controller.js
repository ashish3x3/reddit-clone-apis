const DataStructureDb = require('../models/dataStructure.post.models.js');

/* Data structure to hold a Post in the system */
/*
	@param id : unique Id assigned to the post
	@param content : body of the post
	@param authorId : userId of the user who created the post
*/
const Post = function(id, content, authorId) {
    this.id = id;
    this.content = content;
    this.authorId = authorId;
    this.createTime = new Date();

    /* Total votes this post has received*/
    this.votes = 0;

    /* UserIds who upvoted this post. This field will help us in making beeter decision about the popularity of a post. If a post is popular based on highest number of upvotes, this field could be utilized to check if the votes are from distinct users or few group of people upvoting a post to increase its popularity. In such case we can track that it mostly a spam */
    this.voterIds = [];
};

/* Create a new Post */
exports.create = function(req, res){
	// validate if content is present or not
	if(!req.body.content) {
		return res.status(400).send({
			message:'Post Content cannot be empty'
		});
	}

	// validate if Id of the author who created this post is present or not
	if(!req.body.authorId) {
		return res.status(400).send({
			message:'Post has to be associated with some User. UserId cannot be empty'
		});
	}

	const newPost = new Post(DataStructureDb.posts.length, req.body.content, req.body.authorId);
	DataStructureDb.posts.push(newPost);

	/* If new post is created usccesfully return the status 201 */
	res.status(201).json(newPost);
};

/* Return all the posts in the system. Sending the data in an envelope to overcome various vulnerabilities of sending data as non-enveloped which has potential security risk*/
exports.getAll = function(req, res) {
	/* sending the data in an envelope to overcome various vulnerabilities of sending data as non-enveloped which has potential security risk*/
	let response = {};
	response['data'] = DataStructureDb.posts;
	res.status(200).json(response);
};

/* Upvote a post. This accepts a upvote counter and userID of the user who upvoted the post as params and increment the votes of the post uniquely identified by postId(given by the API) with upvote counter and adds the userId of the voter to the field 'voterIds' if it is already not present */
exports.upvote = function(req,res) {
	// validate upvote increment counter value is present or not. If not return status code 400 with error message: post upvote value cannot be empty
	if(!req.body.upvotes) {
		return res.status(400).send({
			message:'post upvote value cannot be empty'
		});
	}

	/* validate userId of the user who upvoted the post is presnt or not. Any upvote has to be associated with an userId i.e. user who upvoted the post */
	if(!req.body.voterId) {
		return res.status(400).send({
			message:'voterId value cannot be empty'
		});
	}

	/* Store the important entities in a variable*/
	const postId = req.params.id;
	const incrementVoteCount = req.body.upvotes;
	const voterId = req.body.voterId;

	/* If the post is not available in the system, return status code 404 with error message: post does not exist */
	if(DataStructureDb.posts[postId] === false) {
		return res.status(404).send({
		           message: "post does not exist"
		       });
	}

	/* update the post with new value and return the updated post with status 200 */
	DataStructureDb.posts[postId].votes += incrementVoteCount;
	if(DataStructureDb.posts[postId].voterIds.indexOf(voterId) === -1 ) {
		DataStructureDb.posts[postId].voterIds.push(voterId);
	}

	/* If new post is upvoted succesfully return the status 200 with upvoted post */
	res.status(200).json(DataStructureDb.posts[postId]);
};

/* Downvote a post. This accepts a downvote counter and userID of the user who downvoted the post as params and decrement the votes of the post uniquely identified by postId(given by the API) with upvote counter and adds the userId of the voter to the field 'voterIds' if it is already not present */
exports.downvote = function(req,res) {
	// validate downvote decrement counter value is present or not. If not present return status 400 - with error message:post downvote value cannot be empty
	if(!req.body.downvotes) {
		return res.status(400).send({
			message:'post downvote value cannot be empty'
		});
	}

	/* validate userId is presnt or not. Any downvote has to be associated with an userId i.e. who downvoted the post. If not present return status 400 - with error message:voterId value cannot be empty */
	if(!req.body.voterId) {
		return res.status(400).send({
			message:'voterId value cannot be empty'
		});
	}

	const postId = req.params.id;
	const decrementVoteCount = req.body.downvotes;
	const voterId = req.body.voterId;

	/* If post is not present in the system, return status 404 with error message:post does not exist*/
	if(DataStructureDb.posts[postId] === false) {
		return res.status(404).send({
		           message: "post does not exist"
		       });
	}

	DataStructureDb.posts[postId].votes -= decrementVoteCount;
	if(DataStructureDb.posts[postId].voterIds.indexOf(voterId) === -1 ) {
		DataStructureDb.posts[postId].voterIds.push(voterId);
	}

	/* If new post is downvoted succesfully return the status 200 with downvoted post */
	res.status(200).json(DataStructureDb.posts[postId]);
};


exports.popularPosts = function(req,res) {
	//check if limit is present in the URI. Limit is used to determine how many top posts by upvotes has to be returned
	let limit = req.params.limit;

	/* If limit is not defined then return top 20 upvoted posts*/
	if(!limit) {
		limit  = 20;
	}

	/* sort the posts by upvote count */
	const topNPosts = DataStructureDb.posts.sort(function (obj1, obj2) {
	  return obj1.votes < obj2.votes;
	}).slice(0, limit);

	/* return the top N = :limit posts */
	res.status(200).json(topNPosts);
}