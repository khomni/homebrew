import React from 'react';
import { Route, Switch } from 'react-router-dom';

export const LoreList = ({ match, lore, filter, setFilter}) => (
  <div>
    <input className="form-input" name="search" onChange={setFilter} value={filter.search} placeholder={`Search ${name}`}/>
    {lore.map(l => <Lore key={l.id} lore={l}/>)}
  </div>
)

const Lore = ({ match, lore }) => (
  <div dangerouslySetInnerHTML={{ __html: lore.$content }}/>
)

export default Lore
