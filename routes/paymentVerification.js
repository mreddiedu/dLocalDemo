var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET users listing. */
router.get('/', function(req, res, next) {
  fs.readFile('public/paymentVerification.html', function (err, html){
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(html + '');
    res.end();
  })
});

module.exports = router;
