var express = require('express');
var router = express.Router();

// you can get back to the journal index from this module at any time by rediredting to req.baseURL
router.use((req,res,next)=> {
  res.locals.THEME = req.session.theme || 'wood'
  return res.locals.character.getItems()
  .then(items => {
    res.locals.character.Items = items
    return next();
  })
  .catch(next)
})

/* GET users listing. */
router.get('/', Common.middleware.requireCharacter, (req, res, next) => {
  if(req.requestType('json')) return res.send(res.locals.character.Items)
  return res.render('characters/inventory/index')
});

router.get('/new', Common.middleware.requireCharacter, (req, res, next) => {
  if(req.requestType('modal')) return res.render('characters/inventory/modals/edit')
  return res.redirect(req.baseUrl)
});

router.post('/', Common.middleware.requireCharacter, (req,res,next) => {

  return res.locals.character.createItem({
    name: req.body.name || undefined,
    value: req.body.value || undefined,
    weight: req.body.weight || undefined,
    rarity: req.body.rarity || undefined,
    unique: !!req.body.unique || undefined,
    properties: {
      // TODO: this properties object will do all of the system-specific heavy lifting
      blueprint: req.body.blueprint || undefined,
    }
  })
  .then(item => {
    if(!req.body.description) return item
     return item.createLore({content:req.body.description, obscurity:0})
     .then(lore => {
       return item
     })
   })
   .then(item =>{
    if(req.requestType('json')) return res.send(item)
    return res.redirect(res.locals.character.url + '/inventory')
  })
  .catch(next)
});

router.get('/:id/edit', Common.middleware.requireCharacter, (req,res,next) => {
  db.Item.findOne({where:{id:req.params.id}, include:[{model: db.Lore, as:'lore'}]})
  .then(item =>{
    if(req.requestType('modal')) return res.render('characters/inventory/modals/edit',{item:item})
  })
  .catch(next)
})

router.post('/:id', Common.middleware.requireCharacter, (req,res,next) => {

  db.Item.findOne({where:{id:req.params.id}})
  .then(item =>{
    for(key in req.body) item[key] = req.body[key]
    return item.save()
  })
  .then(item => {
    if(!req.body.description) return item
     return item.createLore({content:req.body.description, obscurity:0})
     .then(lore => {
       return item
     })
   })
   .then(item =>{
    if(req.requestType('json')) return res.send(item)
    return res.redirect(res.locals.character.url + '/inventory')
  })
  .catch(next)
})

router.delete('/:id', Common.middleware.requireCharacter, (req,res,next) => {

  db.Item.findOne({where:{id:req.params.id}})
  .then(item =>{
    return item.destroy()
  })
  .then(item => {
    if(req.requestType('json')) return res.send(item.get({plain:true}))
    return res.render('modals/_success',{title:'Item Discarded',redirect:req.headers.referer})
  })
  .catch(next)
})

router.use('/:id/lore', (req,res,next) => {
  db.Item.findOne({where:{id:req.params.id}})
  .then(item => {
    res.locals.lorable = item
    return next();
  })
  .catch(next)
}, require('../lore'));



module.exports = router;
