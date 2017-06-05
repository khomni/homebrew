var express = require('express');
var router = express.Router();

// Comments
// mount this middleware onto any resource-specific router that supports comments
// in order to post comments, this router must be mounted after declaring `res.locals.commentable`
// res.locals.commentable must have Comments as an associ
// e.g. characterRouter, questRouter,



// get all comments on the resource indicated by `res.locals.commentable`
router.get('/', (req,res,next) => {
  if(!res.locals.commentable) return next(Common.error.notfound('Could not locate the commentable resource'))
  res.locals.breadcrumbs.push({name: "Comments", url:req.baseUrl});

  return res.locals.commentable.getComments({
    include:[
      {model:db.Comment, as: 'descendents', hierarchy:true,
        include:[
          {model:db.Character},
          {model:db.User}
        ]
      },
      {model:db.Character},
      {model:db.User}
    ]
  })
  .then(comments => {
    // console.log(comments)
    if(req.json) return res.json(comments)
    // ajax comments, load in just the comment markup
    if(req.xhr) return res.render('comments/_comments',{comments:comments});
    return res.json(comments)
  })
  .catch(next)
});

// posts a single comment to commentable
router.post('/', Common.middleware.requireUser, (req,res,next) => {
  if(!res.locals.commentable) return next(Common.error.notfound('Could not locate the commentable resource'))
  // create a comment on this resource as the active character
  return res.locals.commentable.createComment(Object.assign(req.body,{
    // if an activeChar is available, post as that character
    CharacterId: req.user.MainChar ? req.user.MainChar.id: null,
    // otherwise, post it as the user
    UserId: !req.user.MainChar ? req.user.id : null

  }))
  .then(comment => {
    if(req.json) return res.json(comment)
    // TODO add async comment insertion
    if(req.xhr) return res.render('comments/_comment',{comment:comment})
    return res.redirect(req.headers.referer)
  })
  .catch(next)
});

router.get('/new', Common.middleware.requireUser, (req,res,next) => {
  if(req.modal) return res.render('comments/modals/edit',{comment: null, action:req.baseUrl})
  return next();
})

commentRouter = express.Router({mergeParams: true})

router.use('/:id', (req,res,next) => {

  return db.Comment.findOne({
    where:{id:req.params.id},
    include: [
      {model: db.Comment, as: 'descendents',hierarchy:true},
      {model: db.Comment, as: 'ancestors'},
    ],
  })
  .then(comment => {
    res.locals.comment = comment
    return next()
  })
  .catch(next)

}, commentRouter);

commentRouter.post('/',(req,res,next) => {
  return res.locals.comment.update(req.body)
  .then(comment => {
    if(req.json) return res.json(comment)
    // TODO add async comment insertion
    if(req.xhr) return res.render('comments/_comment',{comment:comment})
    return res.redirect(req.headers.referer)
  })
})

commentRouter.get('/edit',(req,res,next) => {
  if(req.modal) return res.render('comments/modals/edit',{action:req.baseUrl})
  return next()
})

commentRouter.delete('/',(req,res,next) => {
  // check the comment for children
  console.log('deleteing comment:',res.locals.comment.id)

  // TODO: find a way to implement countind descendents instead of getting them
  return res.locals.comment.getDescendents({order:[['hierarchyLevel','DESC']]})
  .then(descendents => {
    console.log(" checking "+descendents.length+" descendents for removal")
    // add the current comment to the list of comments to possibly be deleted

    // delete archived children from the bottom-up
    return Promise.each(descendents,comment=>{
      console.log("  comment "+comment.id+" archived:",comment.archived)
      // not archived, don't delete or check children
      if(!comment.archived) return comment
      return comment.getDescendents() //
      .then(anyBelow => {
        console.log("    comment "+comment.id+" descendents:",anyBelow.length)
        // nested comments, do not delete
        if(anyBelow.length) return comment
        // child is archived with nothing below, destroy!
        console.log("    comment "+comment.id+": cascade delete")
        return comment.destroy().then(comment=>{return null})
      })
    })
  })
  .then(results => {
    // check descendents again, now that they have been combed through
    return res.locals.comment.getDescendents()
    .then(anyBelow => {
      // still children below, archive and return
      if(anyBelow.length) {
        res.locals.comment.archived = true
        // there are children below, archive this comment and return its structure to be rendered
        return res.locals.comment.save()
      }
      // no children to worry about, crawl up the hierarchy and delete any comments
      return res.locals.comment.getAncestors({order:[['hierarchyLevel','DESC']]})
      .then(ancestors => {
        console.log(" checking "+ancestors.length+" ancestors for removal")

        return res.locals.comment.destroy()
        .then(()=>{
          return Promise.each(ancestors, comment =>{
            console.log("  comment "+comment.id+" archived:",comment.archived)
            if(!comment.archived) return comment
            return comment.getDescendents()
            .then(anyBelow => {
              console.log("    comment "+comment.id+" descendents:",anyBelow.length)
              if(anyBelow.length) return comment
              console.log("    comment "+comment.id+": cascade delete")
              return comment.destroy().then(comment=>{return null})
            })
          })
          .then(()=>{return null}) // finally, return null since the comment and its children no longer exist
        })
      })
    })
  })
  .then(comment =>{
    if(req.json) return res.json({ref: comment,kind:'Comment'})
    // rerender the comment as an archived comment
    console.log('partial structure:',JSON.stringify(comment,null,'  '))
    if(req.xhr) return res.render('comments/_comment',{comment:comment})
  })
  .catch(next)
})


// recursive commenting!?
commentRouter.use('/comment', (req,res,next) => {
  res.locals.commentable = res.locals.comment
  return next();
},router);

module.exports = router
