'use strict'

var path = process.cwd();

module.exports = function(app) {
  app.route('/')
    .get(function(req, res) {
      res.send(process.env.NODE_ENV);
    });
};