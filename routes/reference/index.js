var express = require('express');
var router = express.Router();

router.use('/bestiary',require('./bestiary'))


module.exports = router;
