var express = require('express');
var router = express.Router();
var parser = require('xml2json-light');

/* GET result page. */
router.post('/', function(req, res, next) {
    var req_body = JSON.stringify(req.body, null, 2);
    
    console.log('\n', "POST payload from dLocal: ", '\n', '\n', req.body, '\n', '\n');
    
    res.render('result', {title: 'Merchant Redirect Page', dLocalResponse: req_body});
});

router.get('/', function(req, res, next) {
    res.render('result', { title: 'resultGET' });
  });

module.exports = router;
