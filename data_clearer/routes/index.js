var express = require('express');
var router = express.Router();

/* GET home page. */
router.all('/', function(req, res, next) {
  res.setHeader("Clear-Site-Data", "*");
  res.setHeader("Service-Worker-Allowed", "*");
  res.clearCookie("*")
  res.send('POST request to the homepage')
});

module.exports = router;
