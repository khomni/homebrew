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

  var here = req.user.activeChar.location.coordinates

  return Promise.props({
    owned: res.locals.character.getItems({order: [order]}),
    near: db.Item.count({
      where: [{CharacterId:null},db.sequelize.fn('ST_DWithin', db.sequelize.col('location'), db.sequelize.fn('ST_MakePoint', here[0], here[1]),10000),]
    })
  })
  .then(results => {
    res.locals.nearbyItems = results.near
    res.locals.character.Items = results.owned

    var meta = results.owned.reduce((a,b)=>{
      a.total += b.quantity
      a.value += Number(b.value) * b.quantity
      a.weight += Number(b.weight) * b.quantity
      return a
    },{value:0, weight:0, total:0})

    if(req.requestType('json')) return res.json({items: results.owned, total: meta})
    return res.render('characters/inventory/index',{meta:meta})
  })
  .catch(next)
});

router.get('/nearby', Common.middleware.requireCharacter, (req,res,next) => {

  var here = req.user.activeChar.location.coordinates

  return db.Item.findAll({
    attributes: {exclude: ['CharacterId']},
    where: [{CharacterId:null},db.sequelize.fn('ST_DWithin', db.sequelize.col('location'), db.sequelize.fn('ST_MakePoint', here[0], here[1]),10000),]
  }).then(items => {
    if(req.requestType('json')) return res.json(items)
    if(req.requestType('modal')) return res.render('characters/inventory/modals/give',{items:items})

  })
  .catch(next)


})

router.get('/new', Common.middleware.requireCharacter, (req, res, next) => {
  // access the system rules mounted on the middleware
  var systemItem = res.locals.activeSystem.Item

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
});

router.post('/give', Common.middleware.requireCharacter, (req,res,next) => {
  // req.body.item can be an array
  if(!Array.isArray(req.body.item)) req.body.item = [req.body.item]

  return db.Item.findAll({where:{id: {$in: req.body.item}}})
  .then(items => {
    return Promise.map(items, item => {
      return req.user.activeChar.hasItems(item)
      .then(owned => {
        if(owned || !item.CharacterId) {
          item.location = null
          return res.locals.character.addItem(item)
        }
        return null;
      })
    })
    .then(items =>{
      return res.redirect(req.headers.referer)
    })
  })
  .catch(next)
});

router.post('/pickup', Common.middleware.requireCharacter, (req,res,next) => {
  // req.body.item can be an array
  if(!Array.isArray(req.body.item)) req.body.item = [req.body.item]

  return db.Item.findAll({where: {id: {$in: req.body.item}, CharacterId: null}})
  .then(items => {
    return Promise.map(items, item => {
      return req.user.activeChar.addItem(item)
    })
    .then(items =>{
      return res.redirect(req.headers.referer)
    })
  })
  .catch(next)
});

router.post('/', Common.middleware.objectifyBody, (req,res,next) => {

  var baseFields = {}
  var systemFields = {}


  return res.locals.character.createItem(req.body)
  .then(item => {
    if(!req.body.description) return item
     return item.createLore({content:req.body.description, obscurity:0})
     .then(lore => {
       return item
     })
   })
   .then(item =>{
    if(req.requestType('json')) return res.send(item)
    return res.redirect(req.baseUrl)
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
});

router.post('/drop', Common.middleware.requireCharacter, (req,res,next) => {
  if(!Array.isArray(req.body.item)) req.body.item = [req.body.item]

  return db.Item.findAll({where:{id:{$in:req.body.item}}})
  .then(items => {
    return Promise.map(items, item => {
      return req.user.activeChar.hasItems(item)
      .then(owned => {
        if(!owned) return null;
        item.location = req.user.activeChar.location
        return item.save().then(item =>{
          return req.user.activeChar.removeItem(item).then(() => {
            return {ref:item.get({plain:true}),kind:'Item'}
          })
        })
      })
    })
  })
  .then(results => {
    console.log('results:',results)

    if(req.requestType('json')) return res.json(results)
    if(req.requestType('modal')) return res.render('modals/_success',{title:results.length+" items dropped"})
    return res.json({item:item, location:location})
  })
  .catch(next)
})

router.get('/:id', (req,res,next) => {
  return db.Item.findOne({where:{id:req.params.id}, include:[{model: db.Lore, as:'lore'}]})
  .then(item => {
    console.log(JSON.stringify(item,null,'  '))
    if(req.requestType('modal')) return res.render('characters/inventory/modals/detail',{item:item})
    return next()
  })
  .catch(next)
})

router.get('/:id/edit', Common.middleware.requireCharacter, (req,res,next) => {

  var systemItem = res.locals.activeSystem.Item
  if(systemItem) res.locals.systemFields = systemItem.prototype.schema


  db.Item.findOne({where:{id:req.params.id}, include:[{model: db.Lore, as:'lore'}]})
  .then(item =>{
    if(req.requestType('modal')) return res.render('characters/inventory/modals/edit',{item:item})
    return next()
  })
  .catch(next)
})

router.post('/:id', Common.middleware.requireCharacter, Common.middleware.objectifyBody, (req,res,next) => {

  return db.Item.findOne({where:{id:req.params.id}})
  .then(item =>{
    return item.update(req.body)
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
    return res.redirect(req.baseUrl)
  })
  .catch(next)
});

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
