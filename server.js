
require('strict-mode')(function () {
	var express = require('express');
	var helmet = require('helmet');
	var methodOverride = require("method-override");
	var bodyParser = require('body-parser')

	// load the routers from routes folder
	var indexRouter = require('./routes');

	// Create a new instance of express
	var app = express();

	app.use(methodOverride());


	/* Since we will be placing our API in different subdomain such as www.heroku.com , it will require implementations of Cross-Origin Resource Sharing (CORS) for the backend */
	var allowCrossDomain = function(req, res, next) {
		res.header('Access-Control-Allow-Origin', '*'); // www.heroku.com
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST');
		res.header('Access-Control-Allow-Headers', 'Content-Type');
		res.header('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept');
		res.header('Content-Type', 'application/json');

		/* If API receive DELETE method in the call, return status 404 with message: http method DELETE is not supported */
	    if ('DELETE' == req.method) {
	      	res.status(404).send({
	      			message:'http method DELETE is not supported'
	      	});
	    } else if('OPTIONS' == req.method) {
	    	/* intercept OPTIONS method. This is required because some broweser before making a POST or PUT request make s a call to OPTIONS */
	    	res.header('Access-Control-Allow-Methods', 'GET, PUT, POST');
	    	res.status(200).json({});
	    } else {
	    	/* contine the processing */
			next();
	    }
	};

	// Tell express to use the body-parser middleware and to not parse extended bodies
	app.use(express.urlencoded({ extended: true }));
	app.use(allowCrossDomain);
	app.use(bodyParser.text({ type: 'application/json' }));



	/* helmet protects app from some well known web vulnerabilities by setting HTTP headers appropriately. Like disabling 'x-powered-by' header, set xssFilter to avoid Cross-site scripting (XSS), etc */
	app.use(helmet());

	/* Since its an API, it is bould to change over time with new requirements. Creating a version v1 for version 1 of this API */
	app.use('/v1', indexRouter);

	app.use(function(req, res, next) {
		res.status(500).send({'message':'Sorry cant find that. The server encountered an unexpected condition which prevented it from fulfilling the request. Double check the URL'});
	});

	app.listen(process.env.PORT || 4001, function(err) {
		if (err) {
			throw err
		}

		if(process.env.PORT !== undefined) {
			console.log('Listening on port ...',process.env.PORT);
		} else {
			console.log('Listening on port 4001 ...');
		}


	})
});
