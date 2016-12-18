var express = require('express');
var router = express.Router();

// you can get back to the journal index from this module at any time by rediredting to req.baseURL
router.use((req,res,next)=> {
  res.locals.THEME = req.session.theme || 'wood'
  return next()
})

/* GET users listing. */
router.get('/', Common.middleware.requireCharacter, (req, res, next) => {
  var order = ['updatedAt','desc']
  if(req.query.sort) {
    order[0] = req.query.sort
    if(req.query.order && ['asc','desc'].indexOf(req.query.order.toLowerCase())>=0) order[1] = req.query.order.toLowerCase()
  }

  return res.locals.character.getItems({order: [order]})
  .then(items => {
    res.locals.character.Items = items
    var meta = items.reduce((a,b)=>{
      a.value += b.value
      a.weight += Number(b.weight)

      return a
    },{value:0, weight:0})

    if(req.requestType('json')) return res.json(items)
    return res.render('characters/inventory/index',{meta:meta})
  })
  .catch(next)
});

router.get('/new', Common.middleware.requireCharacter, (req, res, next) => {
  if(req.requestType('modal')) return res.render('characters/inventory/modals/edit')
  return res.redirect(req.baseUrl)
});


// interface for giving a character an item
// res.locals.character is the receiving character
// res.locals.currentUser.activeChar is the giving character
router.get('/give', Common.middleware.requireCharacter, (req,res,next) => {
  if(!req.requestType('modal')) return next()
  return req.user.activeChar.getItems()
  .then(items => {
    return res.render('characters/inventory/modals/give',{items:items})
  })
  .catch(next)
})

router.post('/give', Common.middleware.requireCharacter, (req,res,next) => {
  // req.body.item can be an array
  if(!Array.isArray(req.body.item)) req.body.item = [req.body.item]

  return db.Item.findAll({where:{id: {$in: req.body.item}}})
  .then(items => {
    return Promise.map(items, item => {
      return req.user.activeChar.hasItems(item)
      .then(owned => {
        if(owned) return res.locals.character.addItem(item)
        return null;
      })
    })
    .then(items =>{
      return res.redirect(req.headers.referer)
    })
  })
  .catch(next)
});

router.post('/', (req,res,next) => {

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

// deletes items referenced by `req.body.item`
router.delete('/', Common.middleware.requireCharacter, (req,res,next) => {
  if(!Array.isArray(req.body.item)) req.body.item = [req.body.item]

  db.Item.findAll({where:{id:{$in:req.body.item}}})
  .then(items => {
    return Promise.map(items, item => {
      return req.user.activeChar.hasItems(item)
      .then(owned => {
        if(!owned) return null;
        return item.destroy().then(()=>{
          return {ref:item, kind:'Item'}
        })
      })
    })
    .then(items => {
      if(req.requestType('json')) return res.json(items)
    })
  })

  .catch(next)
})

router.get('/:id/', (req,res,next) => {
  db.Item.findOne({where:{id:req.params.id}, include:[{model: db.Lore, as:'lore'}]})
  .then(item => {
    if(req.requestType('modal')) return res.render('characters/inventory/modals/detail',{item:item})
    return next()
  })
  .catch(next)
})

router.get('/:id/edit', Common.middleware.requireCharacter, (req,res,next) => {
  db.Item.findOne({where:{id:req.params.id}, include:[{model: db.Lore, as:'lore'}]})
  .then(item =>{
    if(req.requestType('modal')) return res.render('characters/inventory/modals/edit',{item:item})
    return next()
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
    .then(() => {
      if(req.requestType('json')) return res.json({ref:item, kind:'Item'})
      return res.render('modals/_success',{title:'Item Discarded',redirect:req.headers.referer})
    })
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
