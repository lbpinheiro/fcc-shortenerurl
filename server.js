'use strict'

var express = require('express');
var routes = require('./app/routes/routes.js');
//var mongoose = require('mongoose');

var app = express();

// heroku sets NODE_ENV to 'production', in that case 'dotenv' is not loaded
if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}

//mongoose.connect(process.env.MONGO_URI);

routes(app);

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log('Node.js listening on port ' + port);
});