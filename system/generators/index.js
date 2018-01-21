// Generator Class:
// All types of generators should inherit / build upon the main generator
// Generators can be nested
// Arguments:
//      template: an array containing strings and generators
//
// Prototype Methods:
//      generate(): outputs a randomly generated thing

function hashString(string = '') {
  if (Array.prototype.reduce){
    return string
      .split('')
      .reduce((a,b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a
      }, 0);
  }
  var hash = 0;
  if (string.length === 0) return hash;
  for (var i = 0; i < this.length; i++) {
      var character  = this.charCodeAt(i);
      hash  = ((hash << 5) - hash) + character;
      hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

function seedRandom(inputObj) {
  if(inputObj === undefined || inputObj.seed === undefined) return Math.random()
  let output = Math.sin(inputObj.seed) * 10000;
  output -= Math.floor(output);
  ++inputObj.seed; // increment the input seed;
  return output
}

// optionsArray: an array of objects of the form { weight, value } where weight is a Number and value is either a string, a generator or another dictionary
function Dictionary({options, description}) {
  this.options = options
  this.description = description
}

Dictionary.prototype.select = function(seed = {}) {
  const { options: o, description } = this;
  seed.mod = seed.mod || 0
  
  // create a copy of the options so that they can be modified according to this state in generation
  let options = o.map(piece => {
    let formattedPiece = {weight: 1, mod: 0, value: null}
    if(typeof piece === 'string' || piece.constructor === Dictionary || piece.constructor === Generator) {
      formattedPiece.value = piece
      if(piece.options && piece.options.length) formattedPiece.weight = piece.options.length
    }
    else Object.assign(formattedPiece, piece)
    return formattedPiece
  })

  // console.log('options:', options)
  // 1. count the total weight of all options (n)
  //    a. adjust the weight of each option by comparing the seed.mod score:
  // 2. pick a random number from 0 - n
  // 3. return the value of the selected value
  let totalWeight = options.reduce((a,b) => {
    // increase the weight of items that have a 
    let unfavorability = Math.abs(seed.mod - b.mod)
    // console.log(`unfavorability: ${unfavorability}; weight: ${b.weight}; modified weight: ${b.weight / Math.max(unfavorability, 1)}`)
    b.weight = Math.ceil(b.weight / Math.max(unfavorability, 1))
    // b.weight = (b.mod || 0)
    return a + b.weight
  }, 0);

  let randomPick = Math.ceil(seedRandom(seed) * totalWeight)
  let cursor = 0
  let thisOption

  for(let i = 0; i <= options.length; i++) {
    thisOption = options[i]
    // console.log(`[${i}] ${thisOption}`)
    let thisWeight = thisOption.weight
    // if(description) console.log(`${description}: ${cursor} -> ${randomPick} [${i}]`, thisOption)

    // 
    if(cursor + thisWeight >= randomPick) {
      // console.log(`${seed.mod} -> ${seed.mod + (thisOption.mod)}`)
      seed.mod -= (thisOption.mod)
      // console.log(`${seed.mod >= 0 ? '+' : '-'}${Math.abs(seed.mod)}`)
      if(typeof thisOption === 'string') return thisOption
      if(!thisOption.value) return thisOption.value
      if(thisOption.value.constructor === Dictionary) return thisOption.value.select(seed)
      if(thisOption.value.constructor === Generator) return thisOption.value.generate(seed)
      return thisOption.value || thisOption
    }
    cursor += thisWeight
  }
  // console.log('last option:', thisOption);
  // if(cursor >= randomPick) return thisOption

}

function Generator(template, options = {join: ' '}) {
  this.template = template
  this.options = options
}

Generator.prototype.generate = function(seed, mod = 0) {
  const { options: { join } } = this;

  return this.template.map(piece => {
    if(typeof piece === 'string') return piece
    if(piece.constructor === Generator) return piece.generate(seed)
    if(piece.constructor === Dictionary) return piece.select(seed)
  })
  .filter(component => !(component === undefined || component === null || component && component.length === 0))
  .join(join)

}

module.exports = {
  Dictionary,
  Generator,
  hashString,
  generators: {
  
  }
}
