/**
 * The following are some couchdb unit tests
 * @TODO these aren't proper unit tests yet, take care of these...
 */
var couchlib = require('./couchlib');
var assert = require('assert');

couchlib = new couchlib({"user": "admin", "password": "7oZu37d0CEt$"});
couchlib.databases();
couchlib.version();
couchlib.create("rodger", function(r){ console.log(r); couchlib.destroy("rodger") });
