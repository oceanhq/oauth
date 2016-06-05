'use strict'

var express = require('express');
const querystring = require('querystring');
const url = require('url');
const urljoin = require('url-join')

var router = express.Router();

/* GET home page. */
router.get('/authenticate', function(req, res, next) {
  var callback = null;
  if (!req.query.callback) {
    res.send('You must supply a callback URL.');
    return;
  }
  callback = req.query.callback;

  var err = null;
  if (req.query.e){
    err = req.query.e;
  }

  res.render('authenticate', {callback: callback, error: err});
});

router.post('/authenticate', function(req, res) {
  function authDisplayError(err, cb, res) {
    var qs = querystring.stringify({ e: err, callback: cb });

    res.redirect('/authenticate?'+qs);
  }

  var cb = req.body.callback;

  if (!req.body.username) {
    authDisplayError('You must provide a username.', cb, res);
    return;
  }

  var authToken = 'placeholder_auth_token';

  // Merge the callback URL with the token query param
  var cbUrl = url.parse(cb, true);
  // TODO: urljoin really sucks. Swap it out for a smarter URL builder if we need to do this for real auth.
  var redUrl = urljoin(cbUrl.href, '?'+querystring.stringify({TOKEN: authToken}));

  console.log(redUrl);
  res.redirect(redUrl);
});

// We don't have a root path. Helpfully redirect people back to product.
router.get('/', function(req, res) {
  res.redirect(301, 'https://tryocean.com');
});

module.exports = router;
