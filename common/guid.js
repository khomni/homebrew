const crypto = require('crypto');
const hash = crypto.createHash('sha1');

Promise.promisifyAll(crypto);

const GUID_BYTES = 16

function generateSlug(doc, options) {

}

function generateGuid(bytes = GUID_BYTES) {

  // get some random bytes
  return crypto.randomBytesAsync(bytes)
  // convert the random buffer to base64
  .then(buf => buf.toString('base64'))
  // replace the non-url-safe characters with appropriate substitutes
  .then(string => string.replace(/\//gi,'-').replace(/\+/gi,'_').replace(/\=/gi,''))

}

// a function that can be attached to a model's pre-create validation hook that to ensure that its randomly assign GUID is actually unique 
function sequelizeCycleGuid(doc,options){
  let model = this;

  console.log(`Generating GUID for model: ${model.name}`)

  let notUnique = true

  // attempt to generate new GUIDs until a unique one is found
  // in general, collisions are unlikely
  return Promise.while(() => notUnique, () => {
  
    return generateGUID()
    .then(guid => {
      console.log(`GUID attempted: ${guid}`);

      return model.find({where: {id:guid}})
      .then(doc => {
        if(doc) return console.log('GUID collision, retrying'); // 

        notUnique = false;

        // verified unique
        doc.id = guid;

      })
    })
  })
}

module.exports = {
  generateGuid,
  sequelizeCycleGuid,
  generateSlug
}
