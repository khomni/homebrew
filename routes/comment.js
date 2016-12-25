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

	return res.locals.commentable.getComments({
		include:[
			{model:db.Comment,as: 'descendents', hierarchy:true,
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
		console.log(JSON.stringify(comments,null,'  '))
		if(req.requestType('json')) return res.json(comments)
		// ajax comments, load in just the comment markup
		if(req.requestType('xhr')) return res.render('comments/_comments',{comments:comments});
		return res.json(comments)
	})
	.catch(next)
});

// posts a single comment to commentable
router.post('/', Common.middleware.requireUser, (req,res,next) => {
	if(!res.locals.commentable) return next(Common.error.notfound('Could not locate the commentable resource'))
	// create a comment on this resource as the active character
	console.log(db.methods(res.locals.commentable))
	return res.locals.commentable.createComment(Object.assign(req.body,{
		// if an activeChar is available, post as that character
		CharacterId: req.user.activeChar ? req.user.activeChar.id: null,
		// otherwise, post it as the user
		UserId: !req.user.activeChar ? req.user.id : null
	}))
	.then(comment => {
		if(req.requestType('json')) return res.json(comment)
		// TODO add async comment insertion
		if(req.requestType('xhr')) return res.render('comments/_comment',{comment:comment})
		return res.redirect(req.headers.referer)
	})
	.catch(next)
});


commentRouter = express.Router({mergeParams: true})

router.use('/:id', (req,res,next) => {

  return db.Comment.findOne({
    where:{id:req.params.id},
      // include: {model: db.Quest}
    include: [
      {model: db.Comment, as: 'descendents', hierarchy:true},
      {model: db.Comment, as: 'ancestors'},
    ],
  })
  .then(comment => {
		res.locals.comment = comment
		return next()
	})
	.catch(next)

}, commentRouter);


// recursive commenting!?
commentRouter.use('/comment', (req,res,next) => {
	res.locals.commentable = res.locals.comment
  return next();
},router);

module.exports = router
