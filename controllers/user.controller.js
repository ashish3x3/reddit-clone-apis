
const DataStructureDb = require('../models/dataStructure.post.models.js');

const User = function User(id, name) {
    this.id = id;
    this.username = name;
}

/* create a new User and return the newly created user to the caller */
exports.create = function(req, res){
	// validate name is present or not
	if(!req.body.username) {
		return res.status(400).send({
			message:'User name cannot be empty'
		});
	}
	try{
		const newUser = new User(DataStructureDb.users.length, req.body.username);
		DataStructureDb.users.push(newUser);
		res.status(201).json({'data':newUser, 'error':{}});
	} catch (err) {
		return res.status(500).send({
			message:'the server encountered an unexpected condition which prevented it from fulfilling the request'
		});
	}

};

/* return all users listings*/
exports.getAll = function(req, res) {
	try {
		/* sending the data in an envelope to overcome various vulnerabilities of sending data as non-enveloped which has potential security risk*/
		let response = {};
		response['data'] = DataStructureDb.users;
		response['error'] = {};
		res.status(200).json(response);
	} catch (err) {
		return res.status(500).send({
			message:'the server encountered an unexpected condition which prevented it from fulfilling the request'
		});
	}

};

