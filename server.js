'use strict'

var express = require('express');
var routes = require('./app/routes/routes.js');
var mongoose = require('mongoose');

var app = express();

require('dotenv').load();

mongoose.connect(process.env.MONGO_URI);

routes(app);

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log('Node.js listening on port ' + port);
});