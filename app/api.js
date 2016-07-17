'use strict'

var Url = require('./models/url');

function shortenUrl(url) {

  return 'wow';
}

function getHostUrl(req) {
  return req.protocol + '://' + req.get('host');
}

function checkValidUrl(url) {
  return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
}

module.exports = {

  redirect: function (req, res, next) {
    req.url = req.url.substr(1);
    console.log('looking for ' + req.url);

    Url
      .findOne( {$or: [ {'shortenedUrl': req.url}, {'originalUrl': req.url} ]})
      .exec(function(err, result) {
        console.log('inside exec err=' + err + '|result=' + result);

        if (err) {
          res.send({"error": "database connection problem"});
        } else if (result) {
          if (result.originalUrl === req.url) {
            res.send( {"originalUrl": result.originalUrl, "shortenedUrl": result.shortenedUrl} );
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

    /*Url
      .findOne({ 'shortenedUrl': req.url})
      .exec(function(err, result) {
        console.log('inside exec err=' + err + '|result=' + result);

        if (err) {
          res.send({"error": "database connection problem"});
        } else if (result) {
          console.log('redirecting to ' + result.originalUrl)
          res.redirect(result.originalUrl);
        } else if (!checkValidUrl(req.url)) {
          res.send({"error": "not a valid url"});
        } else {
          next();
        }
      });*/
  },

  insertShortenedUrl: function (req, res) {
    var shortenedUrl = shortenUrl(req.url);

    console.log('saving ' + shortenedUrl);

    var newUrl = new Url({"originalUrl": req.url, "shortenedUrl": shortenedUrl});
    newUrl.save(function(err) {
      if (err) {
        res.send({"error": "database connection problem while saving new Url"});
      } else {
        res.send({"originalUrl": req.url, "shortenedUrl": getHostUrl(req) + '/' + shortenedUrl});
      }
    });
  }
};