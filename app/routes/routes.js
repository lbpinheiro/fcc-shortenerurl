'use strict'

var api = require('../api');
var path = process.cwd();

module.exports = function(app) {

  app.get('/', function(req, res) {
    res.sendFile(path + '/public/index.html');
  });

  app.get('/*', api.redirect, api.insertShortenedUrl);
};