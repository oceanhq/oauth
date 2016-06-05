var express = require('express');
var app = express();

app.get('/authenticate', function(req, res) {
  res.send('hello world');
});
