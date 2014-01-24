/*
 * Module for dealing with couchdb requests
 * written by Leslie.A.Cordell 2014
 * MIT LICENSE
 */

module.exports = function couchlib(options) {
	/*@TODO Attachments*/
	/*@TODO Update Design Documents */
	/*@TODO Unit testing for library */
	/*@TODO Maybe implement promises, and a more intuitive way of dealing with library */

	/* Set up our class, if the options aren't an object, throw an error */
	options = options || {};
	var isObj = Object.prototype.toString.call(options).match(/Object/);
	if(!isObj) {
		throw new Error("Couchlib can only be initialised with an object");
	}

	/* Initialise couchlib */
	if("host" in options) this.host = options.host;		
	/* Default host to localhost*/
	else this.host = "127.0.0.1";
	if("port" in options) this.port = options.port;		
	/* Default port to 5984 */
	else this.port = "5984";
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
		var dataquery;
		var request;
	
		/* If we get an alternate host, port or set or auth, use is, otherwise use our instance settings */
		if(!("host" in options) && this.host) options.host = this.host;
		if(!("port" in options) && this.port) options.port = this.port;
		if(!("auth" in options) && this.user && this.password) options.auth = (this.user + ":" + this.password);
		if(!("path" in options)) options.path = "/";
		if(options.path.charAt(0) != "/") options.path = "/" + options.path;

		/* If we have any data, JSON stringify it */
		if("data" in options) { 
			/* Get methods use a query string rather than passing data */
			if(options.method == "GET") {
				dataquery = querystring.stringify(options.data);
				/* If we get a valid data querystring, append it to the path along with a ? */
				if(dataquery.length) options.path = options.path + "?" + querystring.stringify(options.data);
			}
			console.log(options.path);
			/* If there's no headers, set some default ones */
			if(!("headers" in options)) {
				options.headers = {"Accept": "application/json", "Content-Type": "application/json"};
			}
			else { 
				/* If we do have headers, but accept isn't in them, default it to JSON */
				if(!("Accept" in options.headers)) {
					options.headers.Accept = "application/json";
				}
				/* If we do have headers, but content-type isn't in them, default it to JSON */
				if(!("Content-Type" in options.headers)) {
					options.headers.Accept = "application/json";
				}
			} // End else
		} // End if data in options

		/* Callback for our request */
		function onRequest(res) { 
			var result = "";
			/* Everytime we get a piece of data, add it to our result */
			res.on(DATA, function appendToResult(segment) {
				result += segment;
			}); // End appendToResult

			/* As soon as we get the end signal, pass our result to the callback */
			res.on(END, function returnResult(segment) {
				if(callback) callback(result);
				else console.log(result);
			}); // End returnResult
		} // End callback

		/* Callback for error handling; pass it to a callback or log it to the console */
		function onError(error) { 
			error = {"Error": error};
			if(callback) callback(error);
			else console.log(error);
		}

		/* Stringify the data */
		options.data = JSON.stringify(options.data);
		console.log(options);
		/* Go ahead and run our request */
		request = http.request(options, onRequest);
		/* If we have data, and we're not running a get request, write it to the request it */
		if(options.method != "GET" && options.data) request.write(options.data);
		request.on(ERROR, onError);
		request.end();	
	}; // End run

	/* These need to be extended eventually, but they'll work now for basic functionality */

	/* Run a get request, take a path and a callback */
	/* If there are 3 arguments, the 2nd argument becomes data */
	this.get = function(path, callback) {
		var data = {};
		if(arguments.length == 3 ) {
			data = arguments[1];
			callback = arguments[2];
		}
		this.run({"method": "GET", "data" : data, "path": path}, callback);
	}; // End get

	/* Run a put request, take a path, data and a callback */
	this.put = function(path, data, callback) {
		this.run({"path": path, "data": data, "method": "PUT"}, callback);
	}; // End put

	/* Run a post request, take a path, data and a callback */
	this.post = function(path, data, callback) {
		this.run({"path": path, "data": data, "method": "POST"}, callback);
	}; // End put

	/* Run a delete request, take a path, data and a callback */
	this.delete = function(path, data, callback) {
		/* Enable the deleted flag if it's not set */
		data._deleted = true;
		this.run({"path": path, "data": data, "method": "DELETE"}, callback);
	}; // End put

	/* Create a database, take a database name and a callback */
	this.create = function(dbname, callback) {
		/* Strip any forward slashes and then add one at the beginning*/
		this.run({"path": dbname, "method" :"PUT"}, callback);
	}; // End create

	/* Destroy a database, take a database name and a callback */
	this.destroy = function(dbname, callback) {
		/* Strip any forward slashes and then add one at the beginning*/
		this.run({"path": dbname, "method" :"DELETE"}, callback);
	}; // End create

	/* Get the couchdb version, take in a callback */
	this.version = function(callback) {
		this.get("/", function(response){
			/* If we get a version number pass it to the callback */
			var error = {"Error": "Unable To Get Version"};
			response = JSON.parse(response);
			if("version" in response) {
				if(callback) callback(response.version);
				else console.log(response.version); 
			}
			else {
				if(callback) callback(error);
				else console.error(error); 
			}
		}); // End get
	}; // End version

	/* Show databases, take in a callback */
	this.databases = function(callback) {
		if(callback) this.get("_all_dbs", callback);
		else this.get("_all_dbs", function(response){
			console.log(response);
		});
	}; // End databases

	/* Get uuids, take in a count and a callback */
	this.uuid = function(count, callback) {
		var data = {"count": count};
		if(callback) this.get("_uuids", data, callback);
		else this.get("_uuids", data , function(response){
			console.log(response);
		});
	}; // End uuid 

	/* Create a new document */
	this.document = function(database, schema, callback) {
		/* Get a uuid first */
		var couchlib = this;
		this.uuid(1, function(result){ 
			var uuid;
			var path;
			result = JSON.parse(result);	
			if("uuids" in result) {
				uuid = result.uuids[0];
				path = database + "/" + uuid;
				couchlib.put(path, schema, callback);
			}
			else{
				callback({"Error": result});
			}
		}); 
	}; // End document 

	/* Add an attachment */
	this.attachment = function() {
		//@TODO
	}; // End attachment

	/* Replicate a database, take a source, target and a callback */
	/* An option argument can be taken making 4 arguments, if true */
	/* then the create_target flag is set */
	this.replicate = function(source, target, callback) {
		var create_target = false;
		var data;
		if(arguments.length == 4) {
			create_target = true;	
			callback = arguments[3];
		}
		data = {"source": source, "target": target, "create_target": create_target};
		this.post("_replicate", data, callback);
	}; // End replicate

	/* Design Documents */ 
	/* Create a JSON design document, pass in a database name, a name */
	/* a name for the design, a design doc object, and a callback */
	/* @TODO Allow to specify a file to load from, and add attachments */
	/* @TODO Set up document updates */
	this.design = function(database, name, data, callback) {
		var path;
		var self = this;
		var rev;
		/* Run a get request first, if the design exists, we'll get the revision
		 * to overwrite. */
		this.get(path,  function(response){
			response = JSON.parse(response);
			if("error" in response && response.error == "not_found") {
				/* If the design doesn't exist, use the run function for PUT so we can pass in encoding */	
				path = database + "/_design/" + name; 
				self.run({"path": path, "encoding": "binary", "data": data, "method": "PUT"}, callback);
			}	
			else {
				/* Otherwise get the revision number and then do our put request */
				path = database + "/_design/" + name; 
				data.rev = response._rev;	
				self.run({"path": path, "encoding": "binary", "data": data, "method": "PUT"}, callback);
			}
		}); // End get
	}; // End design

}; // End couchlib


