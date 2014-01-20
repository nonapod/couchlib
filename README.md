couchlib
========

A couchdb interface for nodejs using the http module.

Please note this is by no means a finished library, only a means for me to track this while I build my new site, with a customised couchdb connector, so this will be updated frequently while I tweak things.

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

That's all the library really does at the moment, it doesn't handle secure authentication just yet, no many other useful features. I'll be developing this as I build my new site, and I'll be maintaining it in the future as I'd like to use this for future personal projects. 


