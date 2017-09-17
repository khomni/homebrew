import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import CharacterSearch from './components/character/CharacterSearch';

const Widgets = {
  CharacterSearch
}
export default Widgets;

// set up widgets to render on load
console.log('adding widget listeners');

document.addEventListener('loaded', mountWidgets);
document.addEventListener('shown.modal', mountWidgets);

document.addEventListener('destroy', unmountWidgets);
document.addEventListener('destroyed', e => {
  e.target.remove();
});

document.addEventListener('load', unmountWidgets);

function mountWidgets(e){
  let widgets = Array.prototype.slice.call(e.target.querySelectorAll('[data-widget]'));

  widgets.map(elem => {
    let Widget = Widgets[elem.dataset.widget]
    let dataset = elem.dataset;
    render(<Widget {...elem.dataset} />, elem);
  })
}

function unmountWidgets(e) {
  let widgets = Array.prototype.slice.call(e.target.querySelectorAll('[data-widget]'));

  widgets.map(elem => unmountComponentAtNode(elem))

  e.target.dispatchEvent(new Event('destroyed', {bubbles:true, cancelable:true}));
  return true;
}
