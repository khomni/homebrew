const Image = {
  
  node: image => {
    return db[image.imageable].find({where: {id: image.imagable_id}})
  }
}

module.exports = Image
