
var should = require('should');
var assert = require('assert');
var request = require('supertest');

const url = 'https://limitless-peak-22038.herokuapp.com/v1';
const localurl = 'http://localhost:4001/v1';

describe('POST /posts (create new post in memory)', function () {
	// this.timeout(5000);
	this.timeout(0);

	const post_payload = {
		"content" : "Creating a new post",
		"authorId":"userId-1"
	}

	const post_payload_content_missing = {
		"authorId":"userId-1"
	}

	const post_payload_author_missing = {
		"content" : "Creating a new post"

	}

	const post_payload_invalid_json = {
		"content" : "Creating a new post",
		"authorId":"userId-1"
	}

	const empty_post_label = 'Post Content cannot be empty';
	const empty_author_label = 'Post has to be associated with some User. UserId cannot be empty';
	const invalid_json_label = 'The body of your request is not a valid JSON';
	const server_error_lable = 'The server encountered an unexpected condition which prevented it from fulfilling the request. Double check the URL. Double check the URL';

	it('responds with json for the newly created content', function(done) {
		request(localurl)
			.post('/posts')
			.send(post_payload)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(201) //Status code Created
			.end(function(err,res) {
				if(err) {
					throw done(err);
				}
				/* check if properties are present or not */
				res.body.should.have.property('data');
				res.body.should.have.property('error');
				res.body.data.should.have.property('id');
				res.body.data.should.have.property('content');
				res.body.data.should.have.property('authorId');
				res.body.data.should.have.property('votes');
				res.body.data.should.have.property('voterIds');
				res.body.data.voterIds.should.be.an.instanceOf(Array);
				res.body.data.voterIds.should.be.empty;

				 /* check if properties values are present and matching or not */
				res.body.data.votes.should.equal(0);
				res.body.data.authorId.should.equal(post_payload.authorId);
				res.body.data.content.should.equal(post_payload.content);


				done();
			})
		});

	it('responds with 400 (content cannot be empty)', function(done) {
		request(localurl)
			.post('/posts')
			.send(post_payload_content_missing)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(400) //Status code Malfunction
			.end(function(err,res) {
				if(err) {
					throw done(err);
				}
				/* check if properties are present or not */
				res.body.should.be.type('object');
				res.body.should.have.property('message');
				res.body.should.have.ownProperty('message').equal(empty_post_label);
				done();
			})
	});

	it('responds with 400 (authorId cannot be empty)', function(done) {
		request(localurl)
			.post('/posts')
			.send(post_payload_author_missing)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(400) //Status code Malfunction
			.end(function(err,res) {
				if(err) {
					throw done(err);
				}
				/* check if properties are present or not */
				res.body.should.be.type('object');
				res.body.should.have.property('message');
				res.body.should.have.ownProperty('message').equal(empty_author_label);
				done();
			})
	});

});

describe('GET /posts (get all the posts)', function () {
	this.timeout(0)

	it('returns all the posts in the memory', function(done) {
		request(localurl)
			.get('/posts')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200) //Status code OK
			.end(function(err,res) {
				if(err) {
					throw done(err);
				}
				/* check if properties are present or not */
				res.body.should.be.type('object');
				res.body.should.have.property('data');
				res.body.should.have.property('error');
				// res.body.should.have.ownProperty('data').should.be.an.instanceOf(Array);
				res.body.data.should.be.an.instanceOf(Array);
				res.body.should.have.ownProperty('data').should.be.empty;
				done();
			})
	});
});


describe('PUT /posts/:id/up (Upvote a Post)', function () {
	this.timeout(0);

	const post_upvote_payload = {
		"upvotes" : 4,
		"voterId":"userId-1"
	}

	const post_upvote_empty_payload = {
		"voterId":"userId-1"
	}

	const post_user_empty_payload = {
		"upvotes" : 4
	}

	const post_payload = {
		"content" : "Creating a new post",
		"authorId":"userId-1"
	}

	const empty_upvote_label = 'post upvote value cannot be empty';
	const empty_user_lable = 'voterId value cannot be empty';
	const invalid_json_label  = 'The body of your request is not a valid JSON';
	const server_error_lable = 'Sorry cant find that. The server encountered an unexpected condition which prevented it from fulfilling the request. Double check the URL';
	const post_not_found_lable = 'post does not exist';

	let postId = -1;

	beforeEach(function (done) {
		request(localurl)
			.post('/posts')
			.send(post_payload)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(201) //Status code Created
			.end(function(err,res) {
				if(err) {
					throw done(err);
				}
				request(localurl)
					.get('/posts')
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200) //Status code OK
					.end(function(err,res) {
						if(err) {
							throw done(err);
						}
						postId = res.body.data[0].id;
						done();
					});

			    // done();
			});

	});



	it('upvotes a post by certain number', function(done) {

		/* create a post */
		        request(localurl)
		            .post('/posts')
		            .send(post_payload)
		            .set('Accept', 'application/json')
		            .expect('Content-Type', /json/)
		            .expect(201) //Status code Created
		            .end(function(err,res) {
		                if(err) {
		                    throw done(err);
		                }
		                /* check if properties are present or not */
		                res.body.data.should.have.property('id');
		                res.body.data.should.have.property('content');
		                res.body.data.should.have.property('authorId');
		                res.body.data.should.have.property('votes');
		                res.body.data.should.have.property('voterIds');

		                /* upvote the posy identified by post.id*/
		                let postId = res.body.data.id;
		                request(localurl)
		                    .put('/posts/'+ postId +'/up')
		                    .send(post_upvote_payload)
		                    .set('Accept', 'application/json')
		                    .expect('Content-Type', /json/)
		                    .expect(200) //Status code OK
		                    .end(function(err,res) {
		                        if(err) {
		                            throw done(err);
		                        }
		                        /* check if properties are present or not */
		                        res.body.data.should.have.property('id');
		                        res.body.data.should.have.property('content');
		                        res.body.data.should.have.property('authorId');
		                        res.body.data.should.have.property('votes');
		                        res.body.data.should.have.property('voterIds');

		                        res.body.data.votes.should.equal(4);
		                        res.body.data.authorId.should.equal(post_payload.authorId);
		                        res.body.data.content.should.equal(post_payload.content);
		                        res.body.data.voterIds.should.eql(["userId-1"]);


		                        done();
		                    })
		                })
	});

	it('parameter upvote empty causes a 400', function(done) {
		request(localurl)
			.put('/posts/'+postId+'/up')
			.send(post_upvote_empty_payload)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(400) //Status code OK
			.end(function(err,res) {
				if(err) {
					throw done(err);
				}
				/* check if properties are present or not */
				res.body.should.be.type('object');
				res.body.should.have.property('message');
				res.body.should.have.ownProperty('message').equal(empty_upvote_label);
				done();
			});
	});

	it('parameter userId empty causes a 400', function(done) {
		request(localurl)
			.put('/posts/'+postId+'/up')
			.send(post_user_empty_payload)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(400) //Status code OK
			.end(function(err,res) {
				if(err) {
					throw done(err);
				}
				/* check if properties are present or not */
				res.body.should.be.type('object');
				res.body.should.have.property('message');
				res.body.should.have.ownProperty('message').equal(empty_user_lable);
				done();
			});

	});

	it('unknown postId causes a 404 post not found', function(done) {
		request(localurl)
			.put('/posts/'+'20'+'/up')
			.send(post_upvote_payload)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(404) //Status code OK
			.end(function(err,res) {
				if(err) {
					throw done(err);
				}
				/* check if properties are present or not */
				res.body.should.be.type('object');
				res.body.should.have.property('message');
				res.body.should.have.ownProperty('message').equal(post_not_found_lable);
				done();
			});
	});

	it('unknown path causes a 500 internal server error', function(done) {
		request(localurl)
			.put('/posts/nonexistent')
			.send(post_upvote_payload)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(500) //Status code OK
			.end(function(err,res) {
				if(err) {
					throw done(err);
				}
				/* check if properties are present or not */
				res.body.should.be.type('object');
				res.body.should.have.property('message');
				res.body.should.have.ownProperty('message').equal(server_error_lable);
				done();
			});
	});

});


describe('PUT /posts/:id/down (Downvote a Post)', function () {
		this.timeout(0);

		const post_downvote_payload = {
			"downvotes" : 4,
			"voterId":"userId-1"
		}

		const post_downvote_empty_payload = {
			"voterId":"userId-1"
		}

		const post_user_empty_payload = {
			"downvotes" : 4
		}

		const post_payload = {
			"content" : "Creating a new post",
			"authorId":"userId-1"
		}

		const empty_downvote_label = 'post downvote value cannot be empty';
		const empty_user_lable = 'voterId value cannot be empty';
		const invalid_json_label  = 'The body of your request is not a valid JSON';
		const server_error_lable = 'Sorry cant find that. The server encountered an unexpected condition which prevented it from fulfilling the request. Double check the URL';
		const post_not_found_lable = 'post does not exist';

		let postId = -1;

		beforeEach(function (done) {
			request(localurl)
				.post('/posts')
				.send(post_payload)
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(201) //Status code Created
				.end(function(err,res) {
					if(err) {
						throw done(err);
					}
					request(localurl)
						.get('/posts')
						.set('Accept', 'application/json')
						.expect('Content-Type', /json/)
						.expect(200) //Status code OK
						.end(function(err,res) {
							if(err) {
								throw done(err);
							}
							postId = res.body.data[0].id;
							done();
						});
				});

		});

		it('downvote a post by certain number', function(done) {

			/* create a post */
			        request(localurl)
			            .post('/posts')
			            .send(post_payload)
			            .set('Accept', 'application/json')
			            .expect('Content-Type', /json/)
			            .expect(201) //Status code Created
			            .end(function(err,res) {
			                if(err) {
			                    throw done(err);
			                }
			                /* check if properties are present or not */
			                res.body.data.should.have.property('id');
			                res.body.data.should.have.property('content');
			                res.body.data.should.have.property('authorId');
			                res.body.data.should.have.property('votes');
			                res.body.data.should.have.property('voterIds');

			                /* upvote the posy identified by post.id*/
			                let postId = res.body.data.id;
			                request(localurl)
			                    .put('/posts/'+postId+'/down')
			                    .send(post_downvote_payload)
			                    .set('Accept', 'application/json')
			                    .expect('Content-Type', /json/)
			                    .expect(200) //Status code OK
			                    .end(function(err,res) {
			                        if(err) {
			                            throw done(err);
			                        }
			                        /* check if properties are present or not */
			                        res.body.data.should.have.property('id');
			                        res.body.data.should.have.property('content');
			                        res.body.data.should.have.property('authorId');
			                        res.body.data.should.have.property('votes');
			                        res.body.data.should.have.property('voterIds');

			                        res.body.data.votes.should.equal(-4);
			                        res.body.data.authorId.should.equal(post_payload.authorId);
			                        res.body.data.content.should.equal(post_payload.content);
			                        res.body.data.voterIds.should.eql(["userId-1"]);


			                        done();
			                    })
			                })
		});

		it('parameter upvote empty causes a 400', function(done) {
			request(localurl)
				.put('/posts/'+postId+'/down')
				.send(post_downvote_empty_payload)
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(400) //Status code OK
				.end(function(err,res) {
					if(err) {
						throw done(err);
					}
					/* check if properties are present or not */
					res.body.should.be.type('object');
					res.body.should.have.property('message');
					res.body.should.have.ownProperty('message').equal(empty_downvote_label);
					done();
				});
		});

		it('parameter userId empty causes a 400', function(done) {
			request(localurl)
				.put('/posts/'+postId+'/down')
				.send(post_user_empty_payload)
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(400) //Status code OK
				.end(function(err,res) {
					if(err) {
						throw done(err);
					}
					/* check if properties are present or not */
					res.body.should.be.type('object');
					res.body.should.have.property('message');
					res.body.should.have.ownProperty('message').equal(empty_user_lable);
					done();
				});

		});

		it('unknown postId causes a 404 post not found', function(done) {
			request(localurl)
				.put('/posts/'+'20'+'/down')
				.send(post_downvote_payload)
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(404) //Status code OK
				.end(function(err,res) {
					if(err) {
						throw done(err);
					}
					/* check if properties are present or not */
					res.body.should.be.type('object');
					res.body.should.have.property('message');
					res.body.should.have.ownProperty('message').equal(post_not_found_lable);
					done();
				});
		});
});

describe('Access a nonexistent resource URI ', function () {
	const server_error_lable = 'Sorry cant find that. The server encountered an unexpected condition which prevented it from fulfilling the request. Double check the URL';

	it('unknown path causes a 500 internal server error', function(done) {
		request(localurl)
			.put('/posts/nonexistent')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(500) //Status code OK
			.end(function(err,res) {
				if(err) {
					throw done(err);
				}
				/* check if properties are present or not */
				res.body.should.be.type('object');
				res.body.should.have.property('message');
				res.body.should.have.ownProperty('message').equal(server_error_lable);
				done();
			});
	});

});


describe('GET /posts/popularity (Get top N popular Post)', function () {
	const post_upvote_payload = {
		"upvotes" : 4,
		"voterId":"userId-1"
	}

	it('return top 20 posts by upvotes in descending order ', function(done) {
		request(localurl)
			.get('/posts/popularity')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200) //Status code OK
			.end(function(err,res) {
				if(err) {
					throw done(err);
				}
				/* check if properties are present or not */
				res.body.should.be.type('object');
				res.body.should.have.property('data');
				res.body.should.have.property('error');
				// res.body.should.have.ownProperty('data').should.be.an.instanceOf(Array);
				res.body.data.should.be.an.instanceOf(Array);
				// res.body.should.have.ownProperty('data').should.be.empty;
				res.body.data[0].votes.should.be.above(res.body.data[1].votes);
				res.body.data.length.should.not.be.above(20);
				done();
			})
	});

});

describe('GET /posts/popularity/limit (Get top {limit} popular Post)', function () {
	const post_upvote_payload = {
		"upvotes" : 4,
		"voterId":"userId-1"
	}

	it('return top 2 posts by upvotes in descending order ', function(done) {
		request(localurl)
			.get('/posts/popularity/2')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200) //Status code OK
			.end(function(err,res) {
				if(err) {
					throw done(err);
				}
				/* check if properties are present or not */
				res.body.should.be.type('object');
				res.body.should.have.property('data');
				res.body.should.have.property('error');
				res.body.data.should.be.an.instanceOf(Array);
				res.body.data[0].votes.should.be.above(res.body.data[1].votes);
				res.body.data.length.should.not.be.above(2);
				done();
			})

	});

	it('return top 20 posts if limit is less than 0 ', function(done) {
		request(localurl)
			.get('/posts/popularity/-2')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200) //Status code OK
			.end(function(err,res) {
				if(err) {
					throw done(err);
				}
				/* check if properties are present or not */
				res.body.should.be.type('object');
				res.body.should.have.property('data');
				res.body.should.have.property('error');
				res.body.data.should.be.an.instanceOf(Array);
				res.body.data[0].votes.should.be.above(res.body.data[1].votes);
				res.body.data.length.should.not.be.above(20);
				done();
			})

	});

});


describe('OPTIONS / (Check what all method is supported by server)', function () {
	it('return GET, POST and PUT with Status code 200', function(done) {
		request(localurl)
			.options('/posts/')
			.expect('Access-Control-Allow-Methods', 'GET, PUT, POST')
			.expect(200)
			.end(function(err,res) {
				if(err) {
					throw done(err);
				}
				done();
			});
	});
});



