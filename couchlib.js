/*
 * Module for dealing with couchdb requests
 * written by Leslie.A.Cordell 2014
 * MIT LICENSE
 */

module.exports = function couchlib(options) {
	/* Set up our class, if the options aren't an object, throw an error */
	options = options || {};
	var isObj = Object.prototype.toString.call(options).match(/Object/);
	if(!isObj) {
		throw new Error("Couchlib can only be initialised with an object");
	}

	/* Initialise couchlib */
	if("host" in options) this.host = options.host;		
	if("port" in options) this.port = options.port;		
	if("user" in options) this.user = options.user;		
	if("password" in options) this.password = options.password;		

	/* callback function to run our request */
	this.run = function runRequest(options, callback) {
		/* Take in an object of options; the following is an options object example
		 *	{
		 *		"host": "www.example.com",
		 *		"port": "80",
		 *		"method": "POST",
		 *		"path": "/index?action=1223&php=off",
		 *		"headers": {"Header Name": "Header Option"}
		 *		"auth" : "user:password"
		 *	}
		 *
		 */
		/* Some constants */
		var DATA = "data";
		var END = "end";
		var ERROR = "error";
		var http = require('http');
		var querystring = require('querystring');
		var request;
	
		/* If we get an alternate host, port or set or auth, use is, otherwise use our
     * instance settings */
		if(!("host" in options) && this.host) options.host = this.host;
		if(!("port" in options) && this.port) options.port = this.port;
		if(!("auth" in options) && this.user && this.password) options.auth = (this.user + ":" + this.password);

		/* If we have any data, JSON stringify it */
		if("data" in options) { 
			options.data = JSON.stringify(options.data);
			/* If there's no headers, set some default ones */
			if(!("headers" in options)) {
				options.headers = {"Accept": "Application/json", "Content-Type": "Application/json"};
			}			
			else { 
				/* If we do have headers, but accept isn't in them, set it to JSON */
				if(!("Accept" in options.headers)) {
					options.headers.Accept = "Application/json";
				}
				/* If we do have headers, but content-type isn't in them, set it to JSON */
				if(!("Content-Type" in options.headers)) {
					options.headers.Accept = "Application/json";
				}	
			}
		}

		/* Callback for our request */
		function onRequest(res) { 
			var result = "";
			/* Everytime we get a piece of data, add it to our result */
			res.on(DATA, function appendToResult(segment) {
				result += segment;
			}); // End appendToResult

			/* As soon as we get the end signal, pass our result to the callback */
			res.on(END, function returnResult(segment) {
				callback(result);
			}); // End returnResult
		} // End callback

		/* Callback for error handling */
		function onError(error) { 
			console.log({"Error": error}); 
		}

		console.log(options);
		/* Go ahead and run our request */
		request = http.request(options, onRequest);
		/* If we have post data, write it to the request it */
		if(options.data) request.write(options.data);
		request.on(ERROR, onError);
		request.end();	
	}; // End run

}; // End couchlib


