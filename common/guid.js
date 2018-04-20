const crypto = require('crypto');
const hash = crypto.createHash('sha1');

Promise.promisifyAll(crypto);

const GUID_BYTES = 16

function generateSlug({model}) {
  // ignore documents without a name
  return function(doc, options) {
    if(!doc.name || !doc.changed('name')) return doc;

    let originalSlug = doc.slug;
    let isUnique = false;
    let iteration = 0;

    let nameComponents = 1; // start with
    let slugComponents = doc.name.split(/\s/).slice(0, nameComponents); // split the name by whitespace characters

    let slug = doc.slug || slugComponents.join('-').toLowerCase().replace(/[^a-zA-Z0-9_-]/g,'');
    doc.slug = slug;

    console.log(`Checking slugs for model: ${model.name} `)
    // get an array of all slugs with the same base
    return model.aggregate('slug', 'DISTINCT', {where: {slug: {$ilike: slug + '%', $not:originalSlug}}, plain:false})
    .map(distinct => distinct.DISTINCT)
    .then(existingSlugs => {
      console.log('existing slugs:', existingSlugs);

      while(!isUnique) {
        slug = slugComponents.join('-').toLowerCase().replace(/[^a-zA-Z0-9_-]/g,'');
        doc.slug = slug;

        if(!existingSlugs.includes(slug)) {
          isUnique = true;
          return;
        }

        if(nameComponents < doc.name.split(/\s/).length) {
          // if there are more nameComponents, try using more of the name components before incrementing
          nameComponents++;
        } else {
          // if all name components have been utilized, add a number to the end and repeat
          nameComponents = 1;
          iteration++;
        }

        slugComponents = doc.name.split(/\s/).slice(0, nameComponents);
        if(iteration) slugComponents.push(iteration)
      }
    })
    .then(() => doc);
  
  }
}

function generateGuid(bytes = GUID_BYTES) {

  // get some random bytes
  return crypto.randomBytesAsync(bytes)
  // convert the random buffer to base64
  .then(buf => buf.toString('base64'))
  // replace the non-url-safe characters with appropriate substitutes
  .then(string => string.replace(/\=|^-|^_/gi,'').replace(/\//gi,'-').replace(/\+/gi,'_').slice(0,bytes))

}

// a function that can be attached to a model's pre-create validation hook that to ensure that its randomly assign GUID is actually unique 
function sequelizeCycleGuid(doc, options){
  let model = this;

  console.log(`Generating GUID for model: ${model.name}`)

  let notUnique = true

  // attempt to generate new GUIDs until a unique one is found
  // in general, collisions are unlikely
  return Promise.while(() => notUnique, () => {
  
    return generateGuid()
    .then(guid => {
      console.log(`GUID attempted: ${guid}`);

      return model.find({where: {id:guid}})
      .then(dupedoc => {
        if(dupedoc) return console.log('GUID collision, retrying'); // 

        notUnique = false;

        // verified unique
        doc.id = guid;
      })
    })
  })
  .then(() => doc);
}

module.exports = {
  generateGuid,
  sequelizeCycleGuid,
  generateSlug
}
