require('strict-mode')(function () {
	var express = require('express');
	var helmet = require('helmet');
	var methodOverride = require("method-override");

	var indexRouter = require('./routes');
	var app = express();

	app.use(methodOverride());

	/* Since we will be placing our API in different subdomain such as www.heroku.com , it will require implementations of Cross-Origin Resource Sharing (CORS) for the backend */
	var allowCrossDomain = function(req, res, next) {
		res.header('Access-Control-Allow-Origin', '*'); // www.heroku.com
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST');
		res.header('Access-Control-Allow-Headers', 'Content-Type');
		res.header('Content-Type', 'application/json');

		/* If API receive DELETE method in the call, return status 404 with message: http method DELETE is not supported */
	    if ('DELETE' == req.method) {
	      	res.status(404).send({
	      			message:'http method DELETE is not supported'
	      	});
	    } else if('OPTIONS' == req.method) { // intercept OPTIONS method. This is required because some broweser before making a POST or PUT request make s a call to OPTIONS
	    	res.send(200);
	    } else {
	    	/* contine the processing */
			next();
	    }
	};

	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use(allowCrossDomain);

	/* helmet protects app from some well known web vulnerabilities by setting HTTP headers appropriately. Like disabling 'x-powered-by' header, set xssFilter to avoid Cross-site scripting (XSS), etc */
	app.use(helmet());

	/* Since its an API, it is bould to change over time with new requirements. Creating a version v1 for version 1 of this API */
	app.use('/v1', indexRouter);

	app.listen(process.env.PORT || 4001, function() {
		if(process.env.PORT !== undefined) {
			console.log('Listening on port ...',process.env.PORT);
		} else {
			console.log('Listening on port 4001 ...');
		}


	})
});
