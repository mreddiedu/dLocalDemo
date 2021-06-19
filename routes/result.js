var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/', function(req, res, next) {
  res.render('result', { title: 'resultPOST', result: req });
});

router.get('/', function(req, res, next) {
    res.render('result', { title: 'resultGET' });
  });

module.exports = router;
