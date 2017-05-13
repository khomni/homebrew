var express = require('express');
var router = express.Router();

router.get('/', (req,res,next) => {
  return res.status(200).send()
  return res.sendStatus(200)
})

router.post('/', (req,res,next) => {
  if(req.json) return res.json({SYSTEM_blueprint:'generic', rarity:0})
  return res.sendStatus(200)
});

module.exports = router;
