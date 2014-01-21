couchlib
========

A couchdb interface for nodejs using the http module.

**Please note this library is in a very early phase of development, 2 days from me writing this to be precise! I decided to code my own couchdb connector to use in my future projects, including a new personal app I'm writing at the moment. Please don't expect to much of this just yet.**

To get a basic usage out of this in its current state, you can try the following:

1. Import the library
    ```
    var couchlib = require('./couchlib.js');
    ```
2. Grab a new instance and pass in information:
    ```
    couchlib = new couchlib({
      "host": "localhost", 
      "port": "5984", 
      "user": "admin", 
      "password": "password"});
    ```

3. Now go ahead and make some requests:
    ```
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
    ```
    couchlib.create("database name", callback);
    ```
    * To delete a database:
    ```
    couchlib.destroy("database name", callback);
    ```
    * To run a put request:
    ```
    var data = { /*Put some data here*/ };
    couchlib.put("/path/goes/here", data, callback);
    ```
    * To run a get request:
    ```
    couchlib.get("/path/goes/here", callback);
    ```
    * To run a delete request (This automatically adds the _deleted flag):
    ```
    var data = { /*Put some data here*/ };
    couchlib.delete("/path/goes/here", data, callback);
    ```

And that's all at the moment, I'll be changing things considerably the more I go along.
