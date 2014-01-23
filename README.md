couchlib
========

A couchdb interface for nodejs using the http module.

**Please note this library is in a very early phase of development, and only a few days young, so not much error checking and lots to tidy up and change! I decided to code my own couchdb connector to use in my future projects, including a new personal app I'm writing at the moment. As soon as things are stablized and balanced out, I'll restructure the README to reflect a more API based format. Please don't expect to much of this just yet.**

To get a basic usage out of this in its current state, you can try the following:

1. Import the library
    ```javascript
    var couchlib = require('./couchlib.js');
    ```
2. Grab a new instance and pass in information:
    ```javascript
    couchlib = new couchlib({
      "host": "localhost", 
      "port": "5984", 
      "user": "admin", 
      "password": "password"});
    ```

3. Now go ahead and make some requests:
    ```javascript
    /* Set up a callback */
    var callback = function(response) {
      console.log(response);
    };

    /* Set up some post data */
    var postdata = {
      "name": "testuser",
      "password": "password",
      "roles": [],
      "type": "user",
    };
    
    /* Run the request */
    couchlib.run({"data": postdata, "method": "PUT", "path": "/_users/org.couchdb.user:password"}, callback);
    couchlib.run({"method": "GET", "path": "/_users/org.couchdb.user:testuser"}, callback);
    ```

4. To make things easier there are a few helper functions:
    * To create a database:
    ```javascript
    couchlib.create("database name", callback);
    ```

    * To delete a database:
    ```javascript
    couchlib.destroy("database name", callback);
    ```
    
    * To run a put request:
    ```javascript
    var data = { /*Put some data here*/ };
    couchlib.put("path/goes/here", data, callback);
    ```
    
    * To run a get request:
    ```javascript
    /*Without data*/
    couchlib.get("path/goes/here", callback);
    /*With data*/
    couchlib.git("path/goes/here", {"data": "goes here", callback});
    ```
    
    * To run a delete request (This automatically adds the _deleted flag):
    ```javascript
    var data = { /*Put some data here*/ };
    couchlib.delete("path/goes/here", data, callback);
    ```
    
    * To get the CouchDB version:
    ```javascript
    /*If no callback is provided, the version will be logged to the console*/
    couchlib.version(callback);
    ```
    
    * To show a list of databases:
    ```javascript
    /*If no callback is provided, the database list will be logged to the console*/
    couchlib.databases(callback);
    ```
    
    * To get some uuids:
    ```javascript
    /*Pass in a count of 1 or more and an optional callback, no callback will log the uuids to the console*/
    couchlib.uuids(count, callback);
    ```
    
    * To create a document:
    ```javascript
    /*Pass in a database name, a document object and a callback*/
    couchlib.document("exampledb", {/*Couch Document Goes Here*/}, callback);
    ```
    
    * To replicate databases
    ```javascript
    /*Pass in a source, target, [create_target], callback*/
    
    /*Without create_target*/
    couchlib.replicate("exampledb1", "exampledb2", callback);
    
    /*With create target*/
    couchlib.replicate("exampledb1", "exampledb2", true, callback);
    ```
And that's all at the moment, I'll be changing things considerably the more I go along.
