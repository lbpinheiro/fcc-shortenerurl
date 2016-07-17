'use strict'

var express = require('express');
var routes = require('./app/routes/routes.js');
var mongo = require('mongodb').MongoClient;

var app = express();

// heroku sets NODE_ENV to 'production', in that case 'dotenv' is not loaded
if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}

mongo.connect(process.env.MONGO_URI, function(err, db) {
  if (err) throw err;

  console.log('db=' + db);
});

routes(app);

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log('Node.js listening on port ' + port);
});