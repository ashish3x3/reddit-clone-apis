
const DataStructureDb = require('../models/dataStructure.post.models.js');

module.exports = function User(id, name) {
    this.id = id;
    this.name = name;
}

/* create a new User and return the newly created user to the caller */
exports.create = function(req, res){
	// validate name is present or not
	if(!req.body.name) {
		return res.status(400).send({
			message:'User name cannot be empty'
		});
	}

	const newUser = new User(DataStructureDb.users.length, req.body.name);
	DataStructureDb.users.push(newUser);
	res.status(201).json({'data':newUser});
};

/* return all users listings*/
exports.getAll = function(req, res) {
	/* sending the data in an envelope to overcome various vulnerabilities of sending data as non-enveloped which has potential security risk*/
	response = {};
	response['data'] = DataStructureDb.users;
	res.status(200).json(response);
};

