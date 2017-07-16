
// text.replace
// given a target text and a replacement text, randomly swap characters until the target string matches the replacement
module.exports.replacer = (elem, replacement) => {
  let target = elem.innerHTML
  console.log(elem, target, replacement)
  if(target == replacement) return true;
  target = target.split('');
  replacement = replacement.split('');
  // pick a random position from the longest string
  // reroll if the strings already match
  let rng
  while(target[rng] == replacement[rng]) {
    rng = Math.floor(Math.random() * Math.max(target.length, replacement.length))
  }

  target[rng] = replacement[rng] 

  target = target.join('');
  replacement = replacement.join('');
  elem.innerHTML = target;

  setTimeout(() => module.exports.replacer(elem, replacement),10); // short delay
}
