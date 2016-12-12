var express = require('express');
var router = express.Router();

router.use('/bestiary',require('./bestiary'));
router.use('/system',require('./system'));


module.exports = router;
