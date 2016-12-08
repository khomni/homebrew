var express = require('express');
var router = express.Router();

router.get('/', (req,res,next) => {
  if(!res.locals.campaign) return next();

  return res.locals.campaign.getQuests({include: [{ all: true}]})
  .then(quests => {
    res.locals.quests = quests
    return res.render('campaign/quests/index')
  })
  .catch(next)

})


module.exports = router;
