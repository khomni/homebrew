var express = require('express');
var router = express.Router();

// you can get back to the journal index from this module at any time by rediredting to req.baseURL
router.use((req,res,next)=> {
  res.locals.icons = require('~/data/icons')
  res.locals.breadcrumbs.push({name: "Inventory", url:req.baseUrl});
  // res.locals.THEME = req.session.theme || 'wood'
  return next()
})

router.get('/', (req, res, next) => {

  var order = ['updatedAt','desc']

  res.locals.breadcrumbs.pop();

  if(!req.xhr && !req.json && !req.modal) return res.render('characters/inventory/index')
  
  if(req.query.sort) {
    order[0] = req.query.sort
    if(req.query.order && ['asc','desc'].indexOf(req.query.order.toLowerCase())>=0) order[1] = req.query.order.toLowerCase()
  }

  return Promise.resolve().then(()=>{
    if(req.query.nearby) {
      // use the character's current location to find nearby items
      var here = res.locals.character.location.coordinates
      return db.Item.findAll({
        attributes: {exclude: ['CharacterId']},
        where: [{CharacterId:null}, db.sequelize.fn('ST_DWithin', db.sequelize.col('location'), db.sequelize.fn('ST_MakePoint', here[0], here[1]),10000)],
        order: [order]
      })
    }

    // indicate the owner of the items
    res.locals.itemOwner = res.locals.character

    return res.locals.character.getItems({order: [order]})

  })
  .then(items => {
    res.locals.items = items

    // gather meta data about the item collection
    var meta = items.reduce((a,b)=>{
      a.total += b.quantity
      a.value += Number(b.value) * b.quantity
      a.weight += Number(b.weight) * b.quantity
      return a
    },{value:0, weight:0, total:0})

    if(req.json) return res.json({items: items, total: meta})

    if(req.xhr) {
      if(req.query.format=='table') return res.render('characters/inventory/_itemTable',{meta:meta})
      if(req.query.format=='tiles') return res.render('characters/inventory/_itemTiles',{meta:meta})
      return res.render('characters/inventory/_itemTiles',{meta:meta})
    }
    return res.render('characters/inventory/index',{meta:meta})
  })
  .catch(next)
});

router.get('/new', Common.middleware.requireCharacter, (req, res, next) => {
  // access the system rules mounted on the middleware
  var systemItem = res.locals.activeSystem.Item

  if(req.modal) return res.render('characters/inventory/modals/edit')
  return res.redirect(req.baseUrl)

});


// interface for giving a character an item
// res.locals.character is the receiving character
// res.locals.currentUser.MainChar is the giving character
router.get('/give', Common.middleware.requireCharacter, (req,res,next) => {
  return req.user.MainChar.getItems()
  .then(items => {
    res.locals.itemOwner = req.user.MainChar
    if(req.modal) return res.render('characters/inventory/modals/give',{items:items})
    if(req.xhr) return res.render('characters/inventory/_itemTable',{items:items})
  })
  .catch(next)
});

router.post('/give', Common.middleware.requireCharacter, Common.middleware.objectifyBody, (req,res,next) => {

  // req.body.item is an array of object with `id` and `quantity` to drop
  // if the drop quantity is the same as the item quantity, drop the entire item

  var itemsToGive = req.body.item.filter(item => {return item.quantity > 0})

  // instantiate all items in the body that are owned by the MainChar
  return db.Item.findAll({where:{id:{$in:itemsToGive.mapKey('id')}}})
  .then(items => {

    return Promise.map(items, item => {

      return Promise.resolve().then(()=>{
        if(!item.Characterid) return item
        return req.user.MainChar.hasItem(item)
        .then(owned => {
          if(!owned) return null
          return item
        })
      }).then(item => {
        if(!item) return null

        var giveArgument = itemsToGive.find(i =>{return i.id == item.id})

        if(item.quantity <= giveArgument.quantity) {
          return res.locals.character.addItem(item)
        }

        return item.split(giveArgument.quantity)
        .spread((baseItem, splitItem) => {
          res.locals.character.addItem(splitItem)
        })
      })
    })
    .then(() =>{
      if(req.json) return res.json(items)
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
    if(req.json) return res.json(item)
    return res.redirect(req.baseUrl)
  })
  .catch(next)
});

// deletes items referenced by `req.body.item`
router.delete('/', Common.middleware.requireCharacter, Common.middleware.objectifyBody, (req,res,next) => {

  // req.body.item is an array of object with `id` and `quantity` to drop
  // if the drop quantity is the same as the item quantity, drop the entire item
  if(!req.body.item) res.json([])

  var itemsToDelete = req.body.item.filter(item => {return item.quantity > 0})

  // instantiate all items in the body that are owned by the MainChar
  return db.Item.findAll({where:{id:{$in:itemsToDelete.mapKey('id')}}})
  .then(items => {

    return Promise.map(items, item => {

      var dropArgument = itemsToDelete.find(i =>{return i.id == item.id})

      return Promise.resolve().then(()=>{
        if(!item.Characterid) return item
        return req.user.MainChar.hasItem(item)
        .then(owned => {
          if(!owned) return null
          return item
        })
      }).then(item => {
        if(!item) return null
        // drop the entire item
        if(item.quantity <= dropArgument.quantity) {
          return item.destroy().then(()=>{return {ref:item.get({plain:true}),kind:'Item'}})
        }
        item.quantity -= dropArgument.quantity
        return item.save()
      })
    })
    .then(results => {
      if(req.json) return res.json(results)
      return res.redirect(req.baseUrl)
    })
  })
  .catch(next)

});

router.post('/drop', Common.middleware.requireCharacter, Common.middleware.objectifyBody, (req,res,next) => {

  // req.body.item is an array of object with `id` and `quantity` to drop
  // if the drop quantity is the same as the item quantity, drop the entire item

  var itemsToDrop = req.body.item.filter(item => {return item.quantity > 0})

  // instantiate all items in the body that are owned by the MainChar
  return db.Item.findAll({where:{id:{$in:itemsToDrop.mapKey('id')}, CharacterId:req.user.MainChar.id}})
  .then(items => {

    // for each instantiated item, determine whether to drop the whole stack, or split and drop
    return Promise.map(items, item => {

      // get the form data for the instantiated item
      var dropArgument = itemsToDrop.find(i =>{return i.id == item.id})

      return Promise.resolve().then(()=>{
        // drop the entire item
        if(item.quantity <= dropArgument.quantity) {
          item.location = req.user.MainChar.location
          return item.save()
        }

        // duplicate the item and drop the stack
        return item.split(dropArgument.quantity)
        .spread((baseItem, splitItem) => {
          splitItem.location = req.user.MainChar.location
          return splitItem.save()
        })

      })
      .then(itemToDrop => {
        return req.user.MainChar.removeItem(itemToDrop).then(() => {
          return itemToDrop
        })
      })
    })
  })
  .then(results => {
    if(req.modal) return res.render('modals/_success',{title:results.length+" items dropped"})
    return res.json(results)
  })
  .catch(next)

});

var itemRouter = express.Router({mergeParams:true})

router.use('/:id', (req,res,next) => {

  let query = {where:{id:req.params.id, $or: [{CharacterId: res.locals.character.id},{CharacterId:null}]}, include:[{model: db.Lore, as:'lore'}]}

  return db.Item.findOne(query)
  .then(item => {
    res.locals.item = item
    return next()
  })
  .catch(next)
}, itemRouter)


itemRouter.get('/', (req,res,next) => {
  if(req.modal) return res.render('characters/inventory/modals/detail');
  if(req.json) return res.json(res.locals.item);
})

itemRouter.get('/edit', Common.middleware.requireCharacter, (req,res,next) => {

  var systemItem = res.locals.activeSystem.Item
  if(systemItem) res.locals.systemFields = systemItem.prototype.schema

  if(req.modal) return res.render('characters/inventory/modals/edit')
  return next();

})

itemRouter.post('/', Common.middleware.requireCharacter, Common.middleware.objectifyBody, (req,res,next) => {

  return res.locals.item.update(req.body)
  .then(item => {
    if(!req.body.description) return item
     return item.createLore({content:req.body.description, obscurity:0})
     .then(lore => {
       return item
     })
  })
  .then(item =>{
    if(req.json) return res.send(item)
    return res.redirect(req.baseUrl)
  })
  .catch(next)

});

itemRouter.delete('/', Common.middleware.requireCharacter, (req,res,next) => {

  return res.locals.item.destroy()
  .then(() => {
    if(req.json) return res.json({ref:res.locals.item, kind:'Item'})
    return res.render('modals/_success',{title:'Item Discarded',redirect:req.headers.referer})
  })
  .catch(next)

})

itemRouter.use('/lore', (req,res,next) => {
  res.locals.lorable = res.locals.item

  // if this item is owned by the MainChar, they may add lore to it
  if(res.locals.character && res.locals.character.isActiveChar(req.user)) res.locals.permission.write = true

  return next();

}, require('../lore'));

module.exports = router;
