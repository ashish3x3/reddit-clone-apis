
const DataStructureDb = require('../models/dataStructure.post.models.js');

/*
	description: data structure to hold a Post in the system
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
	let parsed;
	/* validate if the body is a valid json or not */
	try {
		parsed = JSON.parse(req.body);
	} catch (err) {
		res.status(400).send({'message':'The body of your request is not a valid JSON'});
	}

	try {
		// validate if content is present or not
		if(!parsed.content) {
			return res.status(400).send({
				message:'Post Content cannot be empty'
			});
		}

		if(typeof parsed.content !== "string"){
			return res.status(400).send({
				message:'Post Content has to be a string'
			});
		}

		// validate if length of content is greater than 256
		if(parsed.content.length > 255) {
			return res.status(400).send({
				message:'Post Content cannot be greater than 256 characters'
			});
		}

		// validate if Id of the author who created this post is present or not
		if(!parsed.authorId) {
			return res.status(400).send({
				message:'Post has to be associated with some User. UserId cannot be empty'
			});
		}

		if(typeof parsed.authorId !== "string"){
			return res.status(400).send({
				message:'UserId has to be a string'
			});
		}

		const newPost = new Post(DataStructureDb.posts.length, encodeURIComponent(parsed.content), encodeURIComponent(parsed.authorId));
		console.log(newPost);
		DataStructureDb.posts.push(newPost);

		/* If new post is created usccesfully return the status 201 */
		res.status(201).json({'data':JSON.parse(decodeURIComponent(JSON.stringify(newPost))), 'error':{}});
	} catch (err) {
		return res.status(500).send({
			message:'the server encountered an unexpected condition which prevented it from fulfilling the request'
		});
	}

};

/* Return all the posts in the system. Sending the data in an envelope to overcome various vulnerabilities of sending data as non-enveloped which has potential security risk*/
exports.getAll = function(req, res) {
	try {
		/* sending the data in an envelope to overcome various vulnerabilities of sending data as non-enveloped which has potential security risk*/
		let response = {};
		let resp = [];
		response['error'] = {};

		DataStructureDb.posts.forEach(function(elem) {
			resp.push(JSON.parse(decodeURIComponent(JSON.stringify(elem))));
		});

		response['data'] = resp;
		res.status(200).json(response);
	} catch (err) {
		return res.status(500).send({
			message:'The server encountered an unexpected condition which prevented it from fulfilling the request'
		});
	}
};

/* Upvote a post. This accepts a upvote counter and userID of the user who upvoted the post as params and increment the votes of the post uniquely identified by postId(given by the API) with upvote counter and adds the userId of the voter to the field 'voterIds' if it is already not present */
exports.upvote = function(req,res) {
	let parsed;
	/* validate if the body is a valid json or not */
	try {
		parsed = JSON.parse(req.body);
	} catch (err) {
		res.status(400).send({'message':'The body of your request is not a valid JSON'});
	}

	/* validate upvote increment counter value is present or not. If not return status code 400 with error message: post upvote value cannot be empty */
	if(!parsed.upvotes) {
		return res.status(400).send({
			message:'post upvote value cannot be empty'
		});
	}

	if(typeof parsed.upvotes !== "number"){
		return res.status(400).send({
			message:'post upvote value has to be a number'
		});
	}

	/* validate userId of the user who upvoted the post is presnt or not. Any upvote has to be associated with an userId i.e. user who upvoted the post */
	if(!parsed.voterId) {
		return res.status(400).send({
			message:'voterId value cannot be empty'
		});
	}

	if(typeof parsed.voterId !== "string"){
		return res.status(400).send({
			message:'voterId has to be a string'
		});
	}

	/* Store the important entities in a variable*/
	const postId = req.params.id;
	const incrementVoteCount = parsed.upvotes;
	const voterId = parsed.voterId;

	/* If the post is not available in the system, return status code 404 with error message: post does not exist */
	if(!(postId in DataStructureDb.posts)) {
		return res.status(404).send({
			message: "post does not exist"
		});
	}

	try {
		/* update the post with new value and return the updated post with status 200 */
		DataStructureDb.posts[postId].votes += incrementVoteCount;
		if(DataStructureDb.posts[postId].voterIds.indexOf(voterId) === -1 ) {
			DataStructureDb.posts[postId].voterIds.push(voterId);
		}

		/* If new post is upvoted succesfully return the status 200 with upvoted post */
		res.status(200).json({'data':JSON.parse(decodeURIComponent(JSON.stringify(DataStructureDb.posts[postId]))), 'error':{}});
	} catch (err) {
		return res.status(500).send({
			message:'the server encountered an unexpected condition which prevented it from fulfilling the request'
		});
	}
};

/* Downvote a post. This accepts a downvote counter and userID of the user who downvoted the post as params and decrement the votes of the post uniquely identified by postId(given by the API) with upvote counter and adds the userId of the voter to the field 'voterIds' if it is already not present */
exports.downvote = function(req,res) {
	let parsed;
	/* validate if the body is a valid json or not */
	try {
		parsed = JSON.parse(req.body);
	} catch (err) {
		res.status(400).send({'message':'The body of your request is not a valid JSON'});
	}

	/* validate downvote decrement counter value is present or not. If not present return status 400 - with error message:post downvote value cannot be empty */
	if(!parsed.downvotes) {
		return res.status(400).send({
			message:'post downvote value cannot be empty'
		});
	}

	if(typeof parsed.downvotes !== "number"){
		return res.status(400).send({
			message:'post downvote value has to be a number'
		});
	}

	/* validate userId is presnt or not. Any downvote has to be associated with an userId i.e. who downvoted the post. If not present return status 400 - with error message:voterId value cannot be empty */
	if(!parsed.voterId) {
		return res.status(400).send({
			message:'voterId value cannot be empty'
		});
	}

	if(typeof parsed.voterId !== "string"){
		return res.status(400).send({
			message:'voterId has to be a string'
		});
	}

	const postId = req.params.id;
	const decrementVoteCount = parsed.downvotes;
	const voterId = parsed.voterId;

	/* If post is not present in the system, return status 404 with error message:post does not exist*/
	if(!(postId in DataStructureDb.posts)) {
		return res.status(404).send({
		           message: "post does not exist"
		       });
	}

	try {
		DataStructureDb.posts[postId].votes -= decrementVoteCount;
		if(DataStructureDb.posts[postId].voterIds.indexOf(voterId) === -1 ) {
			DataStructureDb.posts[postId].voterIds.push(voterId);
		}

		/* If new post is downvoted succesfully return the status 200 with downvoted post */
		res.status(200).json({'data':JSON.parse(decodeURIComponent(JSON.stringify(DataStructureDb.posts[postId]))), 'error':{}});
	} catch (err) {
		return res.status(500).send({
			message:'the server encountered an unexpected condition which prevented it from fulfilling the request'
		});
	}
};


exports.popularPosts = function(req,res) {
	/* check if limit is present in the URI. Limit is used to determine how many top posts by upvotes has to be returned */
	let limit = req.params.limit;

	if(limit !== undefined && typeof parseInt(limit) !== "number"){
		return res.status(400).send({
			message:'limit value has to be a number'
		});
	}

	/* If limit is not defined then return top 20 upvoted posts*/
	if(!limit && limit < 0) {
		limit  = 20;
	}

	try {
		/* sort the posts by upvote count */
		const topNPosts = DataStructureDb.posts.sort(function (obj1, obj2) {
			if (obj1.votes < obj2.votes) {
				return 1;
			} else{
				return -1;
			}
		}).slice(0, limit);

		let resp = [];

		topNPosts.forEach(function(elem) {
			resp.push(JSON.parse(decodeURIComponent(JSON.stringify(elem))));
		});

		/* return the top N = :limit posts */
		res.status(200).json({'data':resp, 'error':{}});
	} catch (err) {
		return res.status(500).send({
			message:'the server encountered an unexpected condition which prevented it from fulfilling the request'
		});
	}
}