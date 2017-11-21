const Quest = {
  subquests: quest => {
    return quest.children || quest.getChildren({scope: 'nested'})
  },
  comments: quest => {
    return quest.comments || quest.getComments()
  }

}

module.exports = Quest
