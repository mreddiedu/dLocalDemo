var express = require('express');
var router = express.Router();
var parser = require('xml2json-light');

/* GET home page. */
router.post('/', function(req, res, next) {
    var req_body = JSON.stringify(req.body, null, 2);
    var req_header = JSON.stringify(req.header, null, 2);
    console.log("hi");
    var joined = [{req_header},{req_body}];
    //res.send(joined);
    
    res.render('result', {dLocalResponse: req_body});
});

router.get('/', function(req, res, next) {
    res.render('result', { title: 'resultGET' });
  });

module.exports = router;
