'use strict'

var express = require('express');
var favicon = require('serve-favicon');
var mongoose = require('mongoose');
var routes = require('./app/routes/routes.js');

var app = express();
var path = process.cwd();

// heroku sets NODE_ENV to 'production', in that case 'dotenv' is not loaded
if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}

mongoose.connect(process.env.MONGODB_URI, function(err) {
  if (err) {
    console.log('mongoose.connect error ' + err);
  } else {
    console.log('mongoose.connect OK');
  }
});

app.use('/public', express.static(path + '/public'));
app.use(favicon(path + '/public/favicon.ico'));

routes(app);

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log('Node.js listening on port ' + port);
});