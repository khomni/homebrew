import React from 'react';

import { Route, NavLink, Switch } from 'react-router-dom';

import ReactMarkdown from 'react-markdown';

export const LoreList = ({ match, lore, filter, setFilter}) => (
  <div>
    <input value={filter && filter.search} className="form-input" name="search" onChange={setFilter}  placeholder={`Search ${name}`}/>
    {lore.map(l => <Lore key={l.id} lore={l}/>)}
  </div>
)

export const Knowledge = ({knowledge, match}) => (
  <div>
    { knowledge.map(category => (
      <section key={category.topic_name}>
        <h3>{category.topic_name}</h3>
        <hr/>
        { category.topics.map(({topic, lore}) => (
          <div key={topic.id}>
            <h4>
              { topic.url ? (
                <NavLink to={topic.url}>{topic.name || '???'}</NavLink>
              ) : (
                <span>{topic.name || '???'}</span>
              )}
            </h4>
            {lore.map(entry => (<Lore key={entry.id} match={match} lore={entry}/>))}
          </div>
        ))}
      </section>
    ))}
  </div>

)

const Lore = ({ match, lore }) => (
  <div>
    { lore.topic && <NavLink to={lore.topic.url || '/'}>{lore.topic.name}</NavLink>}
    <ReactMarkdown source={lore.content}/>
  </div>
)


export default Lore
