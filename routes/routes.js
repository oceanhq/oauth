'use strict'

var express = require('express');
const request = require('request');
const querystring = require('querystring');
const url = require('url');
const urljoin = require('url-join');
const crypto = require('crypto');

var router = express.Router();

const GH_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GH_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

router.get('/authenticate', function(req, res, next) {
  res.render('authenticate', {client_id: GH_CLIENT_ID});
});

function exchangeGithubTokenForCode(githubToken) {
  var cipher = crypto.createCipher('aes256', CLIENT_SECRET);
  var encrypted = cipher.update(githubToken, 'hex', 'hex');
  encrypted += cipher.final('hex');

  return encrypted;
}

router.get('/callback', function(req, res) {
  var code = req.query.code;

  if(!code) {
    res.send('Error: You must supply a code param.')
    return;
  }

  request({
    method: 'GET',
    url: 'https://github.com/login/oauth/access_token',
    json: {
      client_id: GH_CLIENT_ID,
      client_secret: GH_CLIENT_SECRET,
      code: code,
      accept: 'json'
    }
  }, function(error, response, body) {

    if(response.statusCode == 200) {
      console.log("Body: "+JSON.stringify(body));
    } else {
      console.log("Error: "+response.statusCode);
    }

    var accessToken = body.access_token;

    if(!accessToken) {
      res.send('No access_token received from Github. Error: '+body.error_description);
      return;
    }

    var code = exchangeGithubTokenForCode(accessToken);

    res.send({
      result: "CALLBACK!",
      code: code,
      accessToken: accessToken
    });
  });
});

router.post('/exchange', function(req, res) {
  var encrypted = req.body.code;
  var decipher = crypto.createDecipher('aes256', CLIENT_SECRET);


  var githubToken = decipher.update(encrypted);

  res.send({
    token: githubToken
  });
});

// We don't have a root path. Helpfully redirect people back to product.
router.get('/', function(req, res) {
  res.redirect(301, 'https://tryocean.com');
});

module.exports = router;
