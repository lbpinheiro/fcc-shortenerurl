'use strict'

var Url = require('./models/url');
var possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";

/**
 * Generates the shortened url
 */
function shortenUrl(url) {
  // inspired by: http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
  var short = '';
  for( var i=0; i < 6; i++ )
        short += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  
  return short;
}

/**
 * Returns a valid link for the new generated shortened url
 */
function getHostUrl(req, shortUrl) {
  return req.protocol + '://' + req.get('host') + '/' + shortUrl;
}

/**
 * Checks if the url is valid
 */
function checkValidUrl(url) {
  // inspired by: http://stackoverflow.com/questions/8667070/javascript-regular-expression-to-validate-url
  return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
}

module.exports = {
  /**
   * It's the BRAIN of this project, handles all the redirection logic
   */
  redirect: function (req, res, next) {
    req.url = req.url.substr(1);
    Url
      .findOne( {$or: [ {'shortenedUrl': req.url}, {'originalUrl': req.url} ]})
      .exec(function(err, result) {

        if (err) {
          res.send({"error": "database connection problem"});
        } else if (result) {
          if (result.originalUrl === req.url) {
            res.send( {"originalUrl": result.originalUrl, "shortenedUrl":  getHostUrl(req, result.shortenedUrl)} );
          } else if (result.shortenedUrl === req.url) {
            res.redirect(result.originalUrl);
          } else {
            res.send( {"error": "hmm... that's pretty weird"} );
          }
        } else if (!checkValidUrl(req.url)) {
          res.send({"error": "not a valid url"});
        } else {
          next();
        }
      });
  },

  /**
   * Insert the generated shortened url in the database for future access
   */
  insertShortenedUrl: function (req, res) {
    var shortenedUrl = shortenUrl(req.url);

    var newUrl = new Url({"originalUrl": req.url, "shortenedUrl": shortenedUrl});
    newUrl.save(function(err) {
      if (err) {
        res.send({"error": "database connection problem while saving new Url"});
      } else {
        res.send({"originalUrl": req.url, "shortenedUrl": getHostUrl(req, shortenedUrl)});
      }
    });
  }
};