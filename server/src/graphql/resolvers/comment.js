const Comment = {
  children: (comment, args) => {

    return comment.comments || comment.getComments()
  },
  // createdAt: comment => Date(comment.createdAt),

  character: comment => {
  
  }
}

function countComments(comments){
  let count = comments.length

  comments.map(comment => {
    if(comment.comments) count += countComments(comment.comments)
  })

  return count;
}

const CommentSection = {
  children: array => array,
  total: array => countComments(array)
}

module.exports = { Comment, CommentSection }
