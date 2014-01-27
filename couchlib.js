/*
 * couchlib
 * written by Leslie.A.Cordell 2014
 * MIT LICENSE
 */

/* couchlib
 * @params   - object
 * @returns  - function
 * @description - module exports couchlib, that can be instantiated with an object
 *              - containing options.
 */
module.exports = function couchlib(options) {
	/*@TODO Attachments*/
	/*@TODO Update Design Documents */
	/*@TODO Unit testing for library */
	/*@TODO Maybe implement promises, and a more intuitive way of dealing with library */

    /* Initialise couchlib */
	options = options || {};
	if(options.host) this.host = options.host;
	else this.host = "127.0.0.1"; // Default host to localhost

	if(options.port) this.port = options.port;
	else this.port = "5984"; // Default to port 5984

	if(options.user) this.user = options.user;
	if(options.password) this.password = options.password;


    /* run
     * @params - object, function
     * @returns - run callback
     * @description - Take in an object of options, run an http request
     */
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
		 */
		/* Some constants */
        var DATA = "data";
        var END = "end";
        var ERROR = "error";
        var GET = "GET";
        var POST = "POST";
        var PUT = "PUT";
        var DELETE = "DELETE";
        var http = require('http');
        var querystring = require('querystring');
        var dataquery;
        var request;
	
		/* If we get an alternate host, port or set or auth, use is, otherwise use our instance settings */
		if(!(options.host) && this.host) options.host = this.host;
		if(!(options.port) && this.port) options.port = this.port;
		if(!(options.auth) && this.user && this.password) options.auth = (this.user + ":" + this.password);
		if(!(options.path)) options.path = "/";
		if(options.path.charAt(0) != "/") options.path = "/" + options.path;

        /* Make sure we now have a host, port and path */
        if(!options.host && !options.port && !options.path) {
            throw new Error("Request must contain at least  a host, a port and a a path");
        }

		/* If we have any data, JSON stringify it */
		if(options.data) {
			/* Get methods use a query string rather than passing data */
			if(options.method == GET) {
				dataquery = querystring.stringify(options.data);
				/* If we get a valid data querystring, append it to the path along with a ? */
				if(dataquery.length) options.path = options.path + "?" + querystring.stringify(options.data);
                options.data = null; // Wipe the data object, we don't need it
			}
			/* If there's no headers, set some default ones */
			if(!(options.headers)) {
				options.headers = {"Accept": "application/json", "Content-Type": "application/json"};
			}
			else { 
				/* If we do have headers, but accept isn't in them, default it to JSON */
				if(!("Accept" in options.headers)) {
					options.headers["Accept"] = "application/json";
				}
				/* If we do have headers, but content-type isn't in them, default it to JSON */
				if(!("Content-Type" in options.headers)) {
					options.headers["Content-Type"] = "application/json";
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

			/* As soon as we get the end signal, pass our result to the callback or console log it */
			res.on(END, function returnResult() {
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
		if(options.data) options.data = JSON.stringify(options.data);
		/* Go ahead and run our request */
		request = http.request(options, onRequest);
		/* If we have data, and we're not running a get request, write it to the request it */
		if(options.method != GET && options.data) request.write(options.data);
		request.on(ERROR, onError);
		request.end();	
	}; // End run

    /* get
     * @params - string, [object], callback
     * @returns - runs callback
     * @description - Run a get request, take optional data object as 2nd parameter
     *                run a callback to handle request response data. Uses run function.
     */
	this.get = function(path,/*[data]*/ callback) {
		var data = {};
		if(arguments.length == 3) {
			data = arguments[1];
			callback = arguments[2];
		}
		this.run({"method": "GET", "data" : data, "path": path}, callback);
	};

    /* put
     * @params - string, [object], callback
     * @returns - runs callback
     * @description - Run a put request, take optional data object as 2nd parameter
     *                run a callback to handle request response data. Uses run function.
     */
	this.put = function(path,/*[data]*/ callback) {
        var data = {};
        if(arguments.length == 3) {
            data = arguments[1];
            callback = arguments[2];
        }
		this.run({"path": path, "data": data, "method": "PUT"}, callback);
	};

    /* post
     * @params - string, [object], callback
     * @returns - runs callback
     * @description - Run a post request, take optional data object as 2nd parameter
     *                run a callback to handle request response data. Uses run function.
     */
	this.post = function(path, /*[data]*/ callback) {
        var data = {};
        if(arguments.length == 3) {
            data = arguments[1];
            callback = arguments[2];
        }
		this.run({"path": path, "data": data, "method": "POST"}, callback);
	};

    /* del
     * @params - string, [object], callback
     * @returns - runs callback
     * @description - Run a delete request, take optional data object as 2nd parameter
     *                run a callback to handle request response data. Uses run function.
     */
	this.del = function(path, /*data*/ callback) {
        var data = {};
        if(arguments.length == 3) {
            data = arguments[1];
            callback = arguments[2];
        }
		data._deleted = true;
		this.run({"path": path, "data": data, "method": "DELETE"}, callback);
	};

    /* create
     * @params - string, callback
     * @returns - runs callback
     * @description - create a new database
     */
	this.create = function(dbname, callback) {
		this.run({"path": dbname, "method" :"PUT"}, callback);
	};

    /* destroy
     * @params - string, callback
     * @returns - runs callback
     * @description - remove a database
     */
	this.destroy = function(dbname, callback) {
		this.run({"path": dbname, "method" :"DELETE"}, callback);
	};

    /* version
     * @params - callback
     * @returns - runs callback
     * @description - get the couchdb version number
     */
	this.version = function(callback) {
		this.get("/", function(response){
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
		});
	};

    /* databases
     * @params - callback
     * @returns - runs callback
     * @description - list all databases
     */
	this.databases = function(callback) {
		if(callback) this.get("_all_dbs", callback);
		else this.get("_all_dbs", function(response){
			console.log(response);
		});
	};

    /* uuid
     * @params - integer, callback
     * @returns - runs callback
     * @description - gets specified amount of uuids from the server
     */
	this.uuid = function(count, callback) {
		var data = {"count": count};
		if(callback) this.get("_uuids", data, callback);
		else this.get("_uuids", data , function(response){
			console.log(response);
		});
	};

    /* document
     * @params - string, object, callback
     * @returns - runs callback
     * @description - creates a new document, needs a database name, an object schema and a callback
     */
	this.document = function(database, schema, callback) {
		var couchlib = this;
		this.uuid(1, function(result){ 
			var uuid;
			var path;
			result = JSON.parse(result);	
			if("uuids" in result) {
                /* Override uuid with schema id if we provided one */
				uuid = schema["_id"] || result.uuids[0];
				path = database + "/" + uuid;
				couchlib.put(path, schema, callback);
			}
			else{
				callback({"Error": result});
			}
		}); 
	};

    /* attachment
     * @params - @TODO
     * @returns - runs callback
     * @description - add an attachment
     */
	this.attachment = function() {
		//@TODO
	};

    /* replicate
     * @params - string, string, [boolean], callback
     * @returns - runs callback
     * @description - Replicate a database, take a source, target, optional create_target flag and callback
     */
	this.replicate = function(source, target, /*[create_target]*/callback) {
		var create_target = false;
		var data;
		if(arguments.length == 4) {
			create_target = true;	
			callback = arguments[3];
		}
		data = {"source": source, "target": target, "create_target": create_target};
		this.post("_replicate", data, callback);
	};

    /* design
     * @params - string, string, object, callback
     * @returns - runs callback
     * @description - create JSON design document, provide a database name, a
     *                design document name, the schema and a callback
     */
	/* @TODO Allow to specify a file to load from, and add attachments */
	/* @TODO Set up document updates */
	this.design = function(database, name, data, callback) {
		var path;
		var self = this;
		var rev;
		/* Run a get request first, to see if design exists */
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
		});
	};

}; // End couchlib


